import { Request, Response } from 'express';
import User from '../../models/users/user';
import { GoogleCalendarService } from '../../services/google/googleClient';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const getGoogleAuthUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authUrl = GoogleCalendarService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ 
      message: 'Error al generar la URL de autenticación de Google',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const handleGoogleCallback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.query;
    const userId = req.user?.id;

    if (!code || !userId) {
      res.status(400).json({ message: 'Código de autorización o usuario no encontrado' });
      return;
    }

    // Obtener tokens de Google
    const tokens = await GoogleCalendarService.getTokensFromCode(code as string);
    
    if (!tokens.refresh_token) {
      res.status(400).json({ message: 'No se pudo obtener el token de actualización' });
      return;
    }

    // Guardar tokens en el usuario
    await User.findByIdAndUpdate(userId, {
      $set: {
        'google.refreshToken': tokens.refresh_token,
        'google.accessToken': tokens.access_token,
        'google.tokenExpiry': tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        'google.calendarConnected': true
      }
    });

    res.json({ 
      message: 'Google Calendar conectado exitosamente',
      connected: true 
    });
  } catch (error) {
    console.error('Error handling Google callback:', error);
    
    // Manejar errores específicos de OAuth2
    if (error instanceof Error) {
      if (error.message.includes('invalid_grant')) {
        res.status(400).json({ 
          message: 'El código de autorización ha expirado o ya ha sido usado. Por favor, intenta conectar nuevamente.',
          error: 'invalid_grant'
        });
        return;
      }
      
      if (error.message.includes('access_denied')) {
        res.status(400).json({ 
          message: 'Acceso denegado por el usuario',
          error: 'access_denied'
        });
        return;
      }
    }
    
    res.status(500).json({ 
      message: 'Error al conectar con Google Calendar',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getCalendarEvents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { startDate, endDate, maxResults = 50 } = req.query;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    // Obtener usuario con tokens de Google
    const user = await User.findById(userId).lean();
    if (!user?.google?.refreshToken) {
      res.status(400).json({ message: 'Google Calendar no está conectado' });
      return;
    }

    // Crear cliente de calendario con manejo de errores
    let calendar;
    try {
      calendar = await GoogleCalendarService.getCalendarClientWithRefresh(user.google.refreshToken);
    } catch (error) {
      console.error('Error creando cliente de calendario:', error);
      
      // Si el refresh token expiró, desconectar al usuario
      if (error instanceof Error && error.message === 'REFRESH_TOKEN_EXPIRED') {
        // Limpiar tokens del usuario
        await User.findByIdAndUpdate(userId, {
          $unset: {
            'google.refreshToken': 1,
            'google.accessToken': 1,
            'google.tokenExpiry': 1,
            'google.calendarConnected': 1
          }
        });
        
        res.status(401).json({ 
          message: 'Tu sesión de Google Calendar ha expirado. Por favor, reconecta tu cuenta.',
          error: 'refresh_token_expired'
        });
        return;
      }
      
      res.status(500).json({ message: 'Error al conectar con Google Calendar' });
      return;
    }

    // Primero, obtener la lista de calendarios para verificar acceso
    const calendarList = await calendar.calendarList.list();
    console.log('Calendarios disponibles para obtener eventos:', calendarList.data.items?.map(cal => ({ id: cal.id, summary: cal.summary })));

    // Configurar parámetros de consulta
    const queryParams: Record<string, any> = { // eslint-disable-line @typescript-eslint/no-explicit-any
      calendarId: 'primary',
      maxResults: parseInt(maxResults as string),
      singleEvents: true,
      orderBy: 'startTime'
    };

    if (startDate) {
      queryParams.timeMin = new Date(startDate as string).toISOString();
    } else {
      // Consultar eventos desde hace 7 días hasta 30 días en el futuro
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      queryParams.timeMin = sevenDaysAgo.toISOString();
    }

    if (endDate) {
      queryParams.timeMax = new Date(endDate as string).toISOString();
    } else {
      // Limitar consulta a 30 días en el futuro
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      queryParams.timeMax = thirtyDaysFromNow.toISOString();
    }

    console.log('Parámetros de consulta de eventos:', queryParams);

    // Obtener eventos
    const { data } = await calendar.events.list(queryParams);
    console.log('Eventos obtenidos de Google Calendar:', data.items?.length || 0);

    // Formatear eventos para el frontend
    const formattedEvents = (data.items || []).map(event => ({
      id: event.id,
      title: event.summary || 'Sin título',
      description: event.description || '',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      allDay: !event.start?.dateTime,
      location: event.location || '',
      attendees: event.attendees?.map(attendee => ({
        email: attendee.email,
        displayName: attendee.displayName,
        responseStatus: attendee.responseStatus
      })) || [],
      creator: event.creator,
      organizer: event.organizer,
      htmlLink: event.htmlLink
    }));

    res.json({ 
      events: formattedEvents,
      total: formattedEvents.length
    });
  } catch (error) {
    console.error('Error getting calendar events:', error);
    res.status(500).json({ 
      message: 'Error al obtener eventos del calendario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const createCalendarEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { 
      title, 
      description, 
      start, 
      end, 
      location, 
      attendees = [] 
    } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    // Validar campos requeridos
    if (!title || !start || !end) {
      res.status(400).json({ message: 'Título, fecha de inicio y fecha de fin son requeridos' });
      return;
    }

    // Obtener usuario con tokens de Google
    const user = await User.findById(userId).lean();
    if (!user?.google?.refreshToken) {
      res.status(400).json({ message: 'Google Calendar no está conectado' });
      return;
    }

    // Crear cliente de calendario con manejo de errores
    let calendar;
    try {
      calendar = await GoogleCalendarService.getCalendarClientWithRefresh(user.google.refreshToken);
    } catch (error) {
      console.error('Error creando cliente de calendario:', error);
      
      // Si el refresh token expiró, desconectar al usuario
      if (error instanceof Error && error.message === 'REFRESH_TOKEN_EXPIRED') {
        // Limpiar tokens del usuario
        await User.findByIdAndUpdate(userId, {
          $unset: {
            'google.refreshToken': 1,
            'google.accessToken': 1,
            'google.tokenExpiry': 1,
            'google.calendarConnected': 1
          }
        });
        
        res.status(401).json({ 
          message: 'Tu sesión de Google Calendar ha expirado. Por favor, reconecta tu cuenta.',
          error: 'refresh_token_expired'
        });
        return;
      }
      
      res.status(500).json({ message: 'Error al conectar con Google Calendar' });
      return;
    }

    // Crear evento con el usuario actual como attendee
    const eventAttendees = [
      { email: user.email }, // Incluir al usuario actual
      ...attendees.map((email: string) => ({ email }))
    ];

    console.log('Attendees del evento:', eventAttendees);
    console.log('Usuario actual:', user.email);

    const event = {
      summary: title,
      description: description || '',
      location: location || '',
      start: {
        dateTime: start,
        timeZone: 'Europe/Madrid'
      },
      end: {
        dateTime: end,
        timeZone: 'Europe/Madrid'
      },
      attendees: eventAttendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 }
        ]
      }
    };

    try {
      // Primero, obtener la lista de calendarios para verificar que tenemos acceso
      const calendarList = await calendar.calendarList.list();
      console.log('Calendarios disponibles:', calendarList.data.items?.map(cal => ({ id: cal.id, summary: cal.summary })));

      const { data } = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: 'all' // Enviar notificaciones a todos los attendees
      });

      console.log('Evento creado en Google Calendar:', {
        id: data.id,
        summary: data.summary,
        start: data.start,
        end: data.end,
        attendees: data.attendees,
        htmlLink: data.htmlLink
      });

      res.status(201).json({
        message: 'Evento creado exitosamente',
        event: {
          id: data.id,
          title: data.summary,
          description: data.description,
          start: data.start?.dateTime || data.start?.date,
          end: data.end?.dateTime || data.end?.date,
          location: data.location,
          htmlLink: data.htmlLink
        }
      });
    } catch (calendarError) {
      console.error('Error creando evento en Google Calendar:', calendarError);
      
      // Si el error es de autenticación, sugerir reconectar
      if (calendarError instanceof Error && 
          (calendarError.message.includes('invalid_grant') || 
           calendarError.message.includes('unauthorized'))) {
        res.status(401).json({ 
          message: 'Token de acceso expirado. Por favor, reconecta tu Google Calendar.',
          error: 'token_expired'
        });
        return;
      }
      
      res.status(500).json({ 
        message: 'Error al crear el evento en Google Calendar',
        error: calendarError instanceof Error ? calendarError.message : 'Error desconocido'
      });
    }
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ 
      message: 'Error al crear evento en el calendario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const disconnectGoogleCalendar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    // Limpiar tokens de Google del usuario
    await User.findByIdAndUpdate(userId, {
      $unset: {
        'google.refreshToken': 1,
        'google.accessToken': 1,
        'google.tokenExpiry': 1,
        'google.calendarConnected': 1
      }
    });

    res.json({ 
      message: 'Google Calendar desconectado exitosamente',
      connected: false 
    });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    res.status(500).json({ 
      message: 'Error al desconectar Google Calendar',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const updateCalendarEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;
    const { 
      title, 
      description, 
      start, 
      end, 
      location, 
      attendees = [] 
    } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (!eventId) {
      res.status(400).json({ message: 'ID del evento es requerido' });
      return;
    }

    // Validar campos requeridos
    if (!title || !start || !end) {
      res.status(400).json({ message: 'Título, fecha de inicio y fecha de fin son requeridos' });
      return;
    }

    // Obtener usuario con tokens de Google
    const user = await User.findById(userId).lean();
    if (!user?.google?.refreshToken) {
      res.status(400).json({ message: 'Google Calendar no está conectado' });
      return;
    }

    // Crear cliente de calendario con manejo de errores
    let calendar;
    try {
      calendar = await GoogleCalendarService.getCalendarClientWithRefresh(user.google.refreshToken);
    } catch (error) {
      console.error('Error creando cliente de calendario:', error);
      
      // Si el refresh token expiró, desconectar al usuario
      if (error instanceof Error && error.message === 'REFRESH_TOKEN_EXPIRED') {
        // Limpiar tokens del usuario
        await User.findByIdAndUpdate(userId, {
          $unset: {
            'google.refreshToken': 1,
            'google.accessToken': 1,
            'google.tokenExpiry': 1,
            'google.calendarConnected': 1
          }
        });
        
        res.status(401).json({ 
          message: 'Tu sesión de Google Calendar ha expirado. Por favor, reconecta tu cuenta.',
          error: 'refresh_token_expired'
        });
        return;
      }
      
      res.status(500).json({ message: 'Error al conectar con Google Calendar' });
      return;
    }

    // Actualizar evento
    const event = {
      summary: title,
      description: description || '',
      location: location || '',
      start: {
        dateTime: start,
        timeZone: 'Europe/Madrid'
      },
      end: {
        dateTime: end,
        timeZone: 'Europe/Madrid'
      },
      attendees: attendees.map((email: string) => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 }
        ]
      }
    };

    const { data } = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: event
    });

    res.json({
      message: 'Evento actualizado exitosamente',
      event: {
        id: data.id,
        title: data.summary,
        description: data.description,
        start: data.start?.dateTime || data.start?.date,
        end: data.end?.dateTime || data.end?.date,
        location: data.location,
        htmlLink: data.htmlLink
      }
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ 
      message: 'Error al actualizar evento en el calendario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const deleteCalendarEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { eventId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    if (!eventId) {
      res.status(400).json({ message: 'ID del evento es requerido' });
      return;
    }

    // Obtener usuario con tokens de Google
    const user = await User.findById(userId).lean();
    if (!user?.google?.refreshToken) {
      res.status(400).json({ message: 'Google Calendar no está conectado' });
      return;
    }

    // Crear cliente de calendario con manejo de errores
    let calendar;
    try {
      calendar = await GoogleCalendarService.getCalendarClientWithRefresh(user.google.refreshToken);
    } catch (error) {
      console.error('Error creando cliente de calendario:', error);
      
      // Si el refresh token expiró, desconectar al usuario
      if (error instanceof Error && error.message === 'REFRESH_TOKEN_EXPIRED') {
        // Limpiar tokens del usuario
        await User.findByIdAndUpdate(userId, {
          $unset: {
            'google.refreshToken': 1,
            'google.accessToken': 1,
            'google.tokenExpiry': 1,
            'google.calendarConnected': 1
          }
        });
        
        res.status(401).json({ 
          message: 'Tu sesión de Google Calendar ha expirado. Por favor, reconecta tu cuenta.',
          error: 'refresh_token_expired'
        });
        return;
      }
      
      res.status(500).json({ message: 'Error al conectar con Google Calendar' });
      return;
    }

    // Eliminar evento
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    });

    res.json({
      message: 'Evento eliminado exitosamente',
      eventId: eventId
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ 
      message: 'Error al eliminar evento del calendario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getCalendarStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const user = await User.findById(userId).select('google').lean();
    const isConnected = user?.google?.calendarConnected || false;

    res.json({ 
      connected: isConnected,
      hasRefreshToken: !!user?.google?.refreshToken
    });
  } catch (error) {
    console.error('Error getting calendar status:', error);
    res.status(500).json({ 
      message: 'Error al obtener estado del calendario',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

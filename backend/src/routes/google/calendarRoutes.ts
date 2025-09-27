import { Router } from 'express';
import { 
  getGoogleAuthUrl,
  handleGoogleCallback,
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  disconnectGoogleCalendar,
  getCalendarStatus
} from '../../controllers/google/calendarController';
import { authenticateToken } from '../../middlewares/authMiddleware';

const router = Router();

// Obtener URL de autenticación de Google
router.get('/auth/url', authenticateToken, getGoogleAuthUrl);

// Callback de Google OAuth
router.get('/callback', authenticateToken, handleGoogleCallback);

// Obtener estado de conexión del calendario
router.get('/status', authenticateToken, getCalendarStatus);

// Obtener eventos del calendario
router.get('/events', authenticateToken, getCalendarEvents);

// Crear evento en el calendario
router.post('/events', authenticateToken, createCalendarEvent);

// Actualizar evento en el calendario
router.put('/events/:eventId', authenticateToken, updateCalendarEvent);

// Eliminar evento del calendario
router.delete('/events/:eventId', authenticateToken, deleteCalendarEvent);

// Desconectar Google Calendar
router.delete('/disconnect', authenticateToken, disconnectGoogleCalendar);

export default router;

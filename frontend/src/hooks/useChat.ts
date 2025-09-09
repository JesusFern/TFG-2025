import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { chatService } from '../services/chatService';
import {
  Mensaje,
  Conversacion,
  Notificacion,
  CrearMensajeDTO,
  CrearConversacionDTO
} from '../types/chat';
import { useSocket } from './useSocket';

interface UseChatReturn {
  // Estado del chat
  conversaciones: Conversacion[];
  conversacionActiva: Conversacion | null;
  mensajes: Mensaje[];
  notificaciones: Notificacion[];
  isLoading: boolean;
  error: string | null;
  
  // Acciones del chat
  seleccionarConversacion: (conversacionId: string) => void;
  enviarMensaje: (data: CrearMensajeDTO) => Promise<void>;
  crearConversacion: (data: CrearConversacionDTO) => Promise<void>;
  archivarConversacion: (conversacionId: string) => Promise<void>;
  eliminarConversacion: (conversacionId: string) => Promise<void>;
  marcarMensajeComoLeido: (mensajeId: string) => Promise<void>;
  
  eliminarMensaje: (mensajeId: string) => Promise<void>;
  
  // Estado de conexión
  isConnected: boolean;
  isConnecting: boolean;
  
  // Utilidades
  refreshConversaciones: () => Promise<void>;
  refreshMensajes: () => Promise<void>;
  clearError: () => void;
}

export const useChat = (): UseChatReturn => {
  const { user } = useAuth();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [notificaciones] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configurar WebSocket para mensajes en tiempo real
  const { socket, isConnected, isConnecting, markManyAsRead } = useSocket({
    onNewMessage: (data) => {
      
      
      // Solo procesar si es para la conversación activa
      if (conversacionActiva && data.conversacionId === conversacionActiva._id) {
        const yaExiste = mensajes.some(m => m._id === data.mensaje._id);
        const isMyMessage = user && (data.mensaje.remitente as unknown as string) === user._id;

        if (yaExiste) {
          // Si es mi mensaje y ya existía, lo marcamos como ENTREGADO
          if (isMyMessage) {
            setMensajes(prev => prev.map(m => m._id === data.mensaje._id ? { ...m, estado: 'entregado' } : m));
          }
          return;
        }

        
        const findParticipant = (id: string) => {
          const p = conversacionActiva.participantes.find(pp => (typeof pp === 'string' ? pp === id : pp._id === id));
          if (!p) return { _id: id, fullName: 'Usuario', email: '', role: 'user' as const };
          if (typeof p === 'string') return { _id: p, fullName: 'Usuario', email: '', role: 'user' as const };
          return p;
        };

        const mensajeConvertido: Mensaje = {
          ...data.mensaje,
          remitente: findParticipant(data.mensaje.remitente as unknown as string),
          destinatario: findParticipant(data.mensaje.destinatario as unknown as string)
        } as unknown as Mensaje;

        // Agregar mensaje a la lista local
        setMensajes(prev => [...prev, mensajeConvertido]);
        
        // Actualizar conversación para mostrar el último mensaje
        setConversaciones(prev => prev.map(conv => 
          conv._id === data.conversacionId 
            ? {
                ...conv,
                ultimoMensaje: data.mensaje._id,
                ultimoMensajeContenido: data.mensaje.contenido,
                ultimoMensajeFecha: data.mensaje.createdAt,
                ultimoMensajeRemitente: {
                  _id: data.mensaje.remitente as unknown as string,
                  fullName: 'Usuario',
                  email: '',
                  role: 'user'
                }
              }
            : conv
        ));
      }
    },
    onMessageRead: ({ mensajeId }) => {
      // Solo marcar como leído si el mensaje es mío (para ver el tick azul)
      setMensajes(prev => prev.map(m => {
        const remitenteId = typeof (m.remitente as unknown) === 'object' ? (m.remitente as unknown as { _id: string })._id : (m.remitente as unknown as string);
        if (m._id === mensajeId && user && remitenteId === user._id) {
          return { ...m, estado: 'leido' };
        }
        return m;
      }));
    },
    onMessageNotification: () => {
      // Aquí puedes manejar notificaciones push si las implementas
    },
    onError: (error) => {
      
      
      // Solo mostrar error si es un error de conexión, no de mensaje
      if (error && typeof error === 'object' && 'error' in error) {
        const errorObj = error as { error: string; details?: string };
        if (errorObj.error === 'Error al enviar el mensaje') {
          // Este es un error del WebSocket al enviar mensaje, pero el mensaje ya se envió por API REST
          // No mostrar error al usuario ya que el mensaje se envió correctamente
          
          return;
        }
      }
      
      // Solo mostrar error de conexión en tiempo real si no es un error de mensaje
      setError('Error de conexión en tiempo real');
    }
  });

  // Refrescar conversaciones
  const refreshConversaciones = useCallback(async () => {
    if (!user?._id) {
      console.log('[useChat] refreshConversaciones: sin user._id');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('[useChat] refreshConversaciones: solicitando conversaciones para', user._id);
      const conversacionesData = await chatService.conversaciones.obtenerConversacionesUsuario(user._id);
      console.log('[useChat] refreshConversaciones: recibido', conversacionesData.length, 'conversaciones');
      setConversaciones(conversacionesData);
    } catch (err) {
      console.error('[useChat] Error refreshing conversations:', err);
      setError('Error al cargar conversaciones');
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  // Refrescar mensajes
  const refreshMensajes = useCallback(async () => {
    if (!conversacionActiva?._id) {
      console.log('[useChat] refreshMensajes: no hay conversacionActiva');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('[useChat] refreshMensajes: solicitando mensajes de', conversacionActiva._id);
      const mensajesData = await chatService.mensajes.obtenerMensajes({
        conversacionId: conversacionActiva._id,
        limit: 100
      });
      
      // Ordenar mensajes por fecha de creación (más antiguos primero)
      const mensajesOrdenados = mensajesData.mensajes.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      console.log('[useChat] refreshMensajes: recibido', mensajesData.mensajes.length, 'mensajes');
      setMensajes(mensajesOrdenados);
    } catch (err) {
      console.error('[useChat] Error refreshing messages:', err);
      setError('Error al cargar mensajes');
    } finally {
      setIsLoading(false);
    }
  }, [conversacionActiva?._id]);

  // Cargar conversaciones cuando el usuario cambie
  useEffect(() => {
    if (user?._id) {
      refreshConversaciones();
    }
  }, [user?._id, refreshConversaciones]);

  // Cargar mensajes cuando cambie la conversación activa
  useEffect(() => {
    if (conversacionActiva?._id) {
      refreshMensajes();
    }
  }, [conversacionActiva?._id, refreshMensajes]);

  // Seleccionar conversación
  const seleccionarConversacion = useCallback((conversacionId: string) => {
    console.log('[useChat] seleccionarConversacion:', conversacionId);
    const conversacion = conversaciones.find(c => c._id === conversacionId);
    if (conversacion) {
      setConversacionActiva(conversacion);
      
      // Unirse a la conversación en WebSocket para recibir mensajes en tiempo real
      if (socket && isConnected) {
        socket.emit('join_conversation', conversacionId);
        console.log('🔌 WebSocket: Unido a conversación:', conversacionId);
      }
    }
  }, [conversaciones, socket, isConnected]);

  // Enviar mensaje
  const enviarMensaje = useCallback(async (data: CrearMensajeDTO) => {
    if (!conversacionActiva || !user) {
      console.log('[useChat] enviarMensaje: faltan conversacionActiva o user');
      return;
    }
    
    try {
      console.log('[useChat] enviarMensaje: preparando destinatario para conversacion', conversacionActiva._id);
      // Validar que la conversación activa tenga participantes válidos
      if (!conversacionActiva.participantes || !Array.isArray(conversacionActiva.participantes)) {
        throw new Error('Conversación activa no tiene participantes válidos');
      }

      // Encontrar el destinatario (el otro participante)
      const destinatario = conversacionActiva.participantes.find(p => {
        // Manejar tanto IDs como objetos de participantes
        if (typeof p === 'string') {
          // Si p es un string (ID), comparar directamente
          return p !== user._id;
        } else if (p && typeof p === 'object' && p._id) {
          // Si p es un objeto, comparar el _id
          return p._id !== user._id;
        }
        
        return false;
      });

      if (!destinatario) {
        console.error('❌ No se pudo encontrar el destinatario. Participantes:', conversacionActiva.participantes);
        throw new Error('No se pudo encontrar el destinatario del mensaje');
      }

      // Extraer el ID del destinatario (puede ser string u objeto)
      const destinatarioId = typeof destinatario === 'string' ? destinatario : destinatario._id;
      
      if (!destinatarioId) {
        console.error('❌ ID del destinatario no válido:', destinatario);
        throw new Error('ID del destinatario no válido');
      }

      // Verificar que no se esté enviando un mensaje a sí mismo
      if (destinatarioId === user._id) {
        throw new Error('No puedes enviar un mensaje a ti mismo');
      }

      console.log('[useChat] Enviando mensaje a:', destinatarioId, 'contenido:', data.contenido);
      
      // Crear el mensaje
      const mensaje = await chatService.mensajes.crearMensaje({
        ...data,
        destinatario: destinatarioId
      });
      
      console.log('[useChat] Mensaje creado exitosamente:', mensaje._id);
      
      // Verificar que el mensaje se creó correctamente
      if (!mensaje || !mensaje._id) {
        throw new Error('El mensaje no se creó correctamente en el backend');
      }
      
      // Normalizar remitente/destinatario para UI
      const remitenteObj = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      };
      const participanteDestino = conversacionActiva.participantes.find(p => (typeof p === 'string' ? p === destinatarioId : p._id === destinatarioId));
      const destinatarioObj = typeof participanteDestino === 'object' && participanteDestino ? participanteDestino : {
        _id: destinatarioId,
        fullName: 'Usuario',
        email: '',
        role: 'user' as const
      };

      const mensajeNormalizado = {
        ...mensaje,
        remitente: remitenteObj,
        destinatario: destinatarioObj
      } as unknown as Mensaje;

      // Agregar mensaje normalizado a la lista local
      setMensajes(prev => [...prev, mensajeNormalizado]);
      
      // Actualizar conversación
      setConversaciones(prev => prev.map(conv => 
        conv._id === conversacionActiva._id 
          ? {
              ...conv,
              ultimoMensaje: mensaje._id,
              ultimoMensajeContenido: mensaje.contenido,
              ultimoMensajeFecha: mensaje.createdAt
            }
          : conv
      ));

      // Enviar mensaje por WebSocket para notificar a otros usuarios en tiempo real
      if (socket && isConnected) {
        socket.emit('send_message', {
          destinatario: destinatarioId,
          contenido: data.contenido,
          tipo: data.tipo,
          prioridad: data.prioridad,
          categoria: data.categoria,
          adjuntos: data.adjuntos,
          metadata: data.metadata,
          respuestaA: data.respuestaA,
          mensajeId: mensaje._id,
          conversacionId: conversacionActiva._id
        });
        console.log('🔌 WebSocket: Mensaje enviado por socket (broadcast existente)');
      }

    } catch (err) {
      setError('Error al enviar el mensaje');
      console.error('Error sending message:', err);
    }
  }, [conversacionActiva, user, socket, isConnected]);

  // Marcar mensajes recibidos como leídos al cargar/abrir conversación
  useEffect(() => {
    if (!user || !conversacionActiva?._id || !isConnected) return;
    const porLeerIds = mensajes
      .filter(m => {
        const destinatarioId = typeof (m.destinatario as unknown) === 'object' ? (m.destinatario as unknown as { _id: string })._id : (m.destinatario as unknown as string);
        return destinatarioId === user._id && (m.estado === 'enviado' || m.estado === 'entregado');
      })
      .map(m => m._id);
    if (porLeerIds.length > 0) {
      markManyAsRead(porLeerIds);
    }
  }, [user, conversacionActiva?._id, isConnected, mensajes, markManyAsRead]);

  // Crear conversación
  const crearConversacion = useCallback(async (data: CrearConversacionDTO) => {
    try {
      const conversacion = await chatService.conversaciones.crearConversacion(data);
      setConversaciones(prev => [...prev, conversacion]);
      setConversacionActiva(conversacion);
    } catch (err) {
      setError('Error al crear conversación');
      console.error('Error creating conversation:', err);
    }
  }, []);

  // Archivar conversación
  const archivarConversacion = useCallback(async (conversacionId: string) => {
    try {
      await chatService.conversaciones.archivarConversacion(conversacionId);
      setConversaciones(prev => prev.map(conv => 
        conv._id === conversacionId ? { ...conv, activa: false } : conv
      ));
      if (conversacionActiva?._id === conversacionId) {
        setConversacionActiva(null);
      }
    } catch (err) {
      setError('Error al archivar conversación');
      console.error('Error archiving conversation:', err);
    }
  }, [conversacionActiva?._id]);

  // Eliminar conversación
  const eliminarConversacion = useCallback(async (conversacionId: string) => {
    try {
      // Nota: El backend no tiene endpoint de eliminación, pero se puede implementar
      setConversaciones(prev => prev.filter(conv => conv._id !== conversacionId));
      if (conversacionActiva?._id === conversacionId) {
        setConversacionActiva(null);
      }
    } catch (err) {
      setError('Error al eliminar conversación');
      console.error('Error deleting conversation:', err);
    }
  }, [conversacionActiva?._id]);

  // Marcar mensaje como leído
  const marcarMensajeComoLeido = useCallback(async (mensajeId: string) => {
    try {
      await chatService.mensajes.marcarComoLeido(mensajeId);
      setMensajes(prev => prev.map(mensaje => 
        mensaje._id === mensajeId ? { ...mensaje, estado: 'leido' } : mensaje
      ));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  }, []);

  

  // Eliminar mensaje
  const eliminarMensaje = useCallback(async (mensajeId: string) => {
    try {
      await chatService.mensajes.eliminarMensaje(mensajeId);
      setMensajes(prev => prev.filter(mensaje => mensaje._id !== mensajeId));
    } catch (err) {
      setError('Error al eliminar mensaje');
      console.error('Error deleting message:', err);
    }
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    conversaciones,
    conversacionActiva,
    mensajes,
    notificaciones,
    isLoading,
    error,
    seleccionarConversacion,
    enviarMensaje,
    crearConversacion,
    archivarConversacion,
    eliminarConversacion,
    marcarMensajeComoLeido,
    eliminarMensaje,
    isConnected,
    isConnecting,
    refreshConversaciones,
    refreshMensajes,
    clearError
  };
};



import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';

interface Mensaje {
  _id: string;
  remitente: string;
  destinatario: string;
  contenido: string;
  tipo: 'texto' | 'imagen' | 'archivo' | 'sistema';
  estado: 'enviado' | 'entregado' | 'leido' | 'archivado';
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  categoria: 'general' | 'entrenamiento' | 'nutricion' | 'consulta' | 'recordatorio';
  createdAt: Date;
  updatedAt: Date;
}

interface Conversacion {
  _id: string;
  participantes: Array<{
    _id: string;
    fullName: string;
    profilePicture?: string | null;
    role: string;
  }>;
  ultimoMensaje?: string;
  ultimoMensajeContenido?: string;
  ultimoMensajeFecha?: Date;
  mensajesNoLeidos: Record<string, number>;
  metadata?: {
    tipo: 'general' | 'entrenamiento' | 'nutricion' | 'consulta';
  };
}

interface ChatState {
  conversaciones: Conversacion[];
  conversacionActiva: Conversacion | null;
  mensajes: Record<string, Mensaje[]>;
  notificaciones: unknown[];
  cargando: boolean;
  error: string | null;
}

type ChatAction =
  | { type: 'SET_CONVERSACIONES'; payload: Conversacion[] }
  | { type: 'SET_CONVERSACION_ACTIVA'; payload: Conversacion | null }
  | { type: 'ADD_MENSAJE'; payload: { conversacionId: string; mensaje: Mensaje } }
  | { type: 'SET_MENSAJES'; payload: { conversacionId: string; mensajes: Mensaje[] } }
  | { type: 'UPDATE_MENSAJE'; payload: { conversacionId: string; mensajeId: string; updates: Partial<Mensaje> } }
  | { type: 'ADD_NOTIFICACION'; payload: unknown }
  | { type: 'SET_CARGANDO'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

const initialState: ChatState = {
  conversaciones: [],
  conversacionActiva: null,
  mensajes: {},
  notificaciones: [],
  cargando: false,
  error: null
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CONVERSACIONES':
      return {
        ...state,
        conversaciones: action.payload
      };

    case 'SET_CONVERSACION_ACTIVA':
      return {
        ...state,
        conversacionActiva: action.payload
      };

    case 'ADD_MENSAJE': {
      const { conversacionId, mensaje } = action.payload;
      const mensajesExistentes = state.mensajes[conversacionId] || [];
      return {
        ...state,
        mensajes: {
          ...state.mensajes,
          [conversacionId]: [...mensajesExistentes, mensaje]
        }
      };
    }

    case 'SET_MENSAJES': {
      const { conversacionId: convId, mensajes } = action.payload;
      return {
        ...state,
        mensajes: {
          ...state.mensajes,
          [convId]: mensajes
        }
      };
    }

    case 'UPDATE_MENSAJE': {
      const { conversacionId: convIdUpdate, mensajeId, updates } = action.payload;
      const mensajesParaActualizar = state.mensajes[convIdUpdate] || [];
      const mensajesActualizados = mensajesParaActualizar.map(msg =>
        msg._id === mensajeId ? { ...msg, ...updates } : msg
      );
      return {
        ...state,
        mensajes: {
          ...state.mensajes,
          [convIdUpdate]: mensajesActualizados
        }
      };
    }

    case 'ADD_NOTIFICACION':
      return {
        ...state,
        notificaciones: [...state.notificaciones, action.payload]
      };

    case 'SET_CARGANDO':
      return {
        ...state,
        cargando: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  socket: ReturnType<typeof useSocket>['socket'];
  isConnected: boolean;
  sendMessage: (data: {
    destinatario: string;
    contenido: string;
    tipo?: string;
    prioridad?: string;
    categoria?: string;
    adjuntos?: unknown[];
    metadata?: unknown;
    respuestaA?: string;
  }) => void;
  joinConversation: (conversacionId: string) => void;
  leaveConversation: (conversacionId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat debe ser usado dentro de un ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Usar el hook useSocket para la funcionalidad de chat en tiempo real
  const {
    socket,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation
  } = useSocket({
    onNewMessage: (data) => {
      console.log('ChatContext: Nuevo mensaje recibido:', data);
      dispatch({
        type: 'ADD_MENSAJE',
        payload: {
          conversacionId: data.conversacionId,
          mensaje: data.mensaje
        }
      });

      // Actualizar la conversación activa si es la misma
      if (state.conversacionActiva?._id === data.conversacionId) {
        // Marcar como leído automáticamente si el usuario está en la conversación
        // Esto se maneja en el hook useSocket
      }
    },
    onMessageNotification: (data) => {
      console.log('ChatContext: Notificación de mensaje:', data);
      dispatch({
        type: 'ADD_NOTIFICACION',
        payload: {
          tipo: 'mensaje',
          mensaje: data.mensaje,
          conversacionId: data.conversacionId,
          remitente: data.remitente,
          timestamp: new Date()
        }
      });
    },
    onUserTyping: (data) => {
      // Aquí podrías manejar el estado de escritura si es necesario
      console.log('ChatContext: Usuario escribiendo:', data);
    },
    onUserJoined: (data) => {
      console.log('ChatContext: Usuario se unió a conversación:', data);
    },
    onUserStatusChange: (data) => {
      console.log('ChatContext: Cambio de estado de usuario:', data);
    },
    onMessageRead: (data) => {
      console.log('ChatContext: Mensaje marcado como leído:', data);
      // Actualizar el estado del mensaje
      dispatch({
        type: 'UPDATE_MENSAJE',
        payload: {
          conversacionId: '', // Necesitarías obtener el conversacionId del mensaje
          mensajeId: data.mensajeId,
          updates: { estado: 'leido' }
        }
      });
    },
    onConnect: () => {
      console.log('ChatContext: Socket conectado');
    },
    onDisconnect: (reason) => {
      console.log('ChatContext: Socket desconectado:', reason);
    },
    onError: (error) => {
      console.error('ChatContext: Error en socket:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: (error as { error?: string })?.error || 'Error en la conexión del chat'
      });
    }
  });

  const value: ChatContextType = {
    state,
    dispatch,
    socket,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

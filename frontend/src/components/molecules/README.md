# Sistema de Chat con WebSockets

Este directorio contiene los componentes del sistema de chat en tiempo real implementado con Socket.IO.

## Componentes Principales

### RealTimeChat
Componente principal para el chat en tiempo real que integra con el sistema de WebSockets.

**Características:**
- Conexión automática al servidor Socket.IO
- Envío y recepción de mensajes en tiempo real
- Indicadores de estado de conexión
- Manejo de errores de conexión
- Soporte para diferentes tipos de mensajes

### ChatMessage
Componente para mostrar mensajes individuales con soporte para:
- Diferentes tipos de mensaje (texto, imagen, archivo, sistema)
- Estados del mensaje (enviado, entregado, leído, archivado)
- Prioridades (baja, normal, alta, urgente)
- Categorías (general, entrenamiento, nutrición, consulta, recordatorio)

### ChatInput
Componente para escribir y enviar mensajes con:
- Validación de entrada
- Soporte para archivos adjuntos
- Indicadores de escritura
- Envío con Enter

### ConversationItem
Componente para mostrar conversaciones en la lista con:
- Información del último mensaje
- Contador de mensajes no leídos
- Indicadores de estado
- Acciones rápidas (archivar, eliminar, pin, mute)

## Integración con WebSockets

### Hook useSocket
El hook `useSocket` maneja toda la lógica de conexión WebSocket:

```typescript
const {
  socket,
  isConnected,
  isConnecting,
  connectionError,
  connect,
  disconnect,
  joinConversation,
  leaveConversation,
  sendMessage,
  markAsRead,
  startTyping,
  stopTyping
} = useSocket({
  onNewMessage: (data) => {
    // Manejar nuevo mensaje
  },
  onMessageNotification: (data) => {
    // Manejar notificación
  },
  onError: (error) => {
    // Manejar errores
  }
});
```

### Contexto del Chat
El `ChatContext` proporciona el estado global del chat y la integración con WebSockets:

```typescript
const { state, dispatch, socket, isConnected } = useChat();
```

## Configuración

### Variables de Entorno
```bash
# URL del servidor backend
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Configuración del Socket
```typescript
// src/config/socket.ts
export const SOCKET_CONFIG = {
  url: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
  options: {
    transports: ['websocket', 'polling'],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000
  }
};
```

## Eventos del Socket

### Eventos de Conexión
- `connect`: Socket conectado exitosamente
- `disconnect`: Socket desconectado
- `connect_error`: Error de conexión

### Eventos de Mensajería
- `new_message`: Nuevo mensaje recibido
- `message_notification`: Notificación de mensaje
- `message_error`: Error en mensaje

### Eventos de Usuario
- `user_typing`: Usuario escribiendo
- `user_joined_conversation`: Usuario se unió a conversación
- `user_status_change`: Cambio de estado de usuario
- `user_online`: Usuario en línea

### Eventos de Mensajes
- `message_read`: Mensaje marcado como leído

## Uso en Componentes

### Ejemplo Básico
```typescript
import { useSocket } from '../../hooks/useSocket';

const ChatComponent = () => {
  const { isConnected, sendMessage } = useSocket({
    onNewMessage: (data) => {
      console.log('Nuevo mensaje:', data);
    }
  });

  const handleSend = (content: string) => {
    sendMessage({
      destinatario: 'userId',
      contenido: content,
      tipo: 'texto'
    });
  };

  return (
    <div>
      <div>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</div>
      {/* Resto del componente */}
    </div>
  );
};
```

### Ejemplo con Conversación
```typescript
import { useChat } from '../../hooks/useChat';

const ChatPage = () => {
  const {
    conversaciones,
    conversacionActiva,
    mensajes,
    isConnected,
    seleccionarConversacion,
    enviarMensaje
  } = useChat();

  // El hook useChat ya maneja la integración con WebSockets
  // Los mensajes se actualizan automáticamente en tiempo real

  return (
    <div>
      {/* Lista de conversaciones */}
      {conversaciones.map(conv => (
        <ConversationItem
          key={conv._id}
          conversacion={conv}
          isActive={conversacionActiva?._id === conv._id}
          onSelect={seleccionarConversacion}
        />
      ))}

      {/* Chat activo */}
      {conversacionActiva && (
        <RealTimeChat
          conversacion={conversacionActiva}
          onSendMessage={enviarMensaje}
        />
      )}
    </div>
  );
};
```

## Manejo de Errores

### Errores de Conexión
```typescript
const { connectionError } = useSocket({
  onError: (error) => {
    console.error('Error de socket:', error);
    // Mostrar notificación al usuario
  }
});
```

### Errores de Mensajes
```typescript
const { error } = useChat();

useEffect(() => {
  if (error) {
    // Mostrar error al usuario
    showNotification(error, 'error');
  }
}, [error]);
```

## Reconexión Automática

El sistema maneja automáticamente la reconexión cuando:
- Se pierde la conexión de red
- El servidor se desconecta
- Hay errores de transporte

La reconexión se intenta hasta 5 veces con un delay exponencial.

## Consideraciones de Rendimiento

- Los mensajes se almacenan localmente para evitar re-renderizados innecesarios
- La conexión WebSocket se mantiene activa mientras el usuario esté autenticado
- Los eventos se limpian automáticamente al desmontar componentes
- Se usa `useCallback` y `useMemo` para optimizar las funciones

## Seguridad

- La autenticación se maneja a través de tokens JWT
- Los usuarios solo pueden acceder a conversaciones donde participan
- La validación se realiza tanto en el frontend como en el backend
- Los mensajes se sanitizan antes de mostrar

## Testing

Para probar el sistema de chat:

1. Asegúrate de que el backend esté ejecutándose
2. Verifica que la URL del socket sea correcta
3. Inicia sesión con un usuario válido
4. Crea o selecciona una conversación
5. Envía mensajes y verifica que se reciban en tiempo real

## Troubleshooting

### Problemas Comunes

1. **Socket no se conecta**
   - Verifica que el backend esté ejecutándose
   - Comprueba la URL en la configuración
   - Verifica que el token de autenticación sea válido

2. **Mensajes no se envían**
   - Verifica el estado de conexión
   - Comprueba que el usuario esté autenticado
   - Verifica los logs del backend

3. **Mensajes no se reciben**
   - Verifica que el usuario esté unido a la conversación
   - Comprueba los permisos de acceso
   - Verifica la configuración de CORS en el backend

### Logs de Debug
El sistema incluye logs detallados para debugging:
- `useSocket: [mensaje]` - Logs del hook de socket
- `ChatContext: [mensaje]` - Logs del contexto del chat
- `Socket.IO: [mensaje]` - Logs nativos de Socket.IO

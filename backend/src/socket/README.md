# 📡 **API WebSocket con Socket.IO - Sistema de Mensajería en Tiempo Real**

## 🎯 **Descripción General**

Este módulo implementa un sistema de mensajería en tiempo real utilizando **Socket.IO** sobre **WebSockets**, proporcionando comunicación instantánea entre clientes y entrenadores/nutricionistas.

## 🚀 **Características Principales**

- ✅ **Comunicación en tiempo real** con latencia mínima
- ✅ **Autenticación JWT** para conexiones seguras
- ✅ **Salas de conversación** para organizar mensajes
- ✅ **Indicadores de escritura** en tiempo real
- ✅ **Estados de usuario** (online/offline)
- ✅ **Notificaciones push** automáticas
- ✅ **Persistencia en MongoDB** para historial completo
- ✅ **Escalabilidad** con arquitectura modular

## 🔌 **Configuración del Servidor**

### **Dependencias**
```bash
npm install socket.io @types/socket.io
```

### **Integración en Server.ts**
```typescript
import { createServer } from "http";
import { SocketServer } from './socket/socketServer';

// Crear servidor HTTP para Socket.IO
const httpServer = createServer(app);

// Inicializar Socket.IO
const socketServer = new SocketServer(httpServer);

// Usar httpServer en lugar de app.listen
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log('Socket.IO inicializado y listo para conexiones WebSocket');
});
```

## 🔐 **Autenticación**

### **Middleware de Autenticación**
```typescript
// El servidor verifica automáticamente el token JWT
// en cada conexión WebSocket
socket.handshake.auth.token || socket.handshake.headers.authorization
```

### **Formato de Conexión**
```typescript
// Frontend
const socket = io('http://localhost:3000', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

## 📡 **Eventos del Servidor**

### **Eventos de Conexión**
| Evento | Descripción | Payload |
|--------|-------------|---------|
| `connection` | Usuario se conecta | `{ userId, userRole }` |
| `disconnect` | Usuario se desconecta | `{ userId, timestamp }` |

### **Eventos de Mensajería**
| Evento | Descripción | Payload |
|--------|-------------|---------|
| `send_message` | Enviar mensaje | `{ destinatario, contenido, tipo, prioridad, categoria, adjuntos, metadata, respuestaA }` |
| `mark_as_read` | Marcar como leído | `{ mensajeId }` |
| `typing_start` | Usuario empieza a escribir | `{ conversacionId }` |
| `typing_stop` | Usuario deja de escribir | `{ conversacionId }` |

### **Eventos de Conversación**
| Evento | Descripción | Payload |
|--------|-------------|---------|
| `join_conversation` | Unirse a conversación | `{ conversacionId }` |
| `leave_conversation` | Salir de conversación | `{ conversacionId }` |
| `user_online` | Notificar que está en línea | `{}` |

## 📨 **Eventos Emitidos por el Servidor**

### **Eventos de Mensajería**
| Evento | Descripción | Payload |
|--------|-------------|---------|
| `new_message` | Nuevo mensaje recibido | `{ mensaje, conversacionId }` |
| `message_notification` | Notificación de mensaje | `{ mensaje, conversacionId, remitente }` |
| `message_read` | Mensaje marcado como leído | `{ mensajeId, leidoPor, timestamp }` |
| `message_error` | Error al enviar mensaje | `{ error, details }` |

### **Eventos de Usuario**
| Evento | Descripción | Payload |
|--------|-------------|---------|
| `user_typing` | Usuario escribiendo | `{ userId, conversacionId, isTyping }` |
| `user_joined_conversation` | Usuario se unió | `{ userId, conversacionId }` |
| `user_status_change` | Cambio de estado | `{ userId, status, timestamp }` |

## 🏗️ **Arquitectura del Sistema**

### **Flujo de Mensaje**
```
1. Cliente emite 'send_message'
2. Servidor valida autenticación
3. Servidor crea mensaje en MongoDB
4. Servidor busca/crea conversación
5. Servidor emite 'new_message' a la sala
6. Servidor crea notificación push
7. Servidor emite 'message_notification' al destinatario
```

### **Gestión de Salas**
```
- user:{userId} - Sala personal del usuario
- conversation:{conversacionId} - Sala de conversación específica
```

### **Manejo de Estados**
```
- En línea: Usuario conectado y activo
- Escribiendo: Usuario está escribiendo en una conversación
- Desconectado: Usuario no está conectado
```

## 🎨 **Implementación en Frontend**

### **Hook useSocket**
```typescript
const {
  isConnected,
  sendMessage,
  joinConversation,
  leaveConversation,
  startTyping,
  stopTyping
} = useSocket({
  onNewMessage: (data) => {
    // Manejar nuevo mensaje
  },
  onUserTyping: (data) => {
    // Manejar indicador de escritura
  }
});
```

### **Componente RealTimeChat**
```typescript
<RealTimeChat 
  conversacion={conversacion}
  onClose={() => setChatAbierto(false)}
/>
```

## 🔧 **Configuración de Entorno**

### **Variables de Entorno**
```env
# Backend
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_BACKEND_URL=http://localhost:3000
```

### **CORS Configuration**
```typescript
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

## 📊 **Métricas y Monitoreo**

### **Logs del Servidor**
```
✅ Usuario {userId} conectado
✅ Usuario {userId} se unió a la conversación {conversacionId}
✅ Usuario {userId} desconectado
❌ Error al enviar mensaje: {error}
```

### **Estados de Conexión**
- **Conectado**: Socket activo y autenticado
- **Desconectado**: Socket cerrado o error de autenticación
- **Reconectando**: Intento automático de reconexión

## 🚨 **Manejo de Errores**

### **Tipos de Error**
```typescript
// Error de autenticación
{ error: 'Token de autenticación requerido' }
{ error: 'Token inválido' }

// Error de mensaje
{ error: 'Error al enviar el mensaje', details: '...' }

// Error de conexión
{ error: 'Socket no está conectado' }
```

### **Recuperación Automática**
- Reconexión automática en caso de desconexión
- Reintento de envío de mensajes fallidos
- Fallback a API REST si WebSocket no está disponible

## 🔒 **Seguridad**

### **Medidas Implementadas**
- ✅ **Autenticación JWT** obligatoria
- ✅ **Validación de permisos** por usuario
- ✅ **Sanitización de datos** de entrada
- ✅ **Rate limiting** implícito por conexión
- ✅ **Logs de auditoría** para todas las acciones

### **Buenas Prácticas**
- Usar HTTPS en producción
- Implementar rate limiting por IP
- Monitorear conexiones sospechosas
- Validar payloads de entrada
- Implementar timeouts de conexión

## 📈 **Escalabilidad**

### **Consideraciones de Escalado**
- **Horizontal**: Múltiples instancias del servidor
- **Vertical**: Optimización de recursos por instancia
- **Redis**: Para compartir estado entre instancias
- **Load Balancer**: Para distribuir conexiones

### **Optimizaciones Futuras**
- Implementar clustering con Redis
- Añadir compresión de mensajes
- Implementar lazy loading de historial
- Añadir métricas de rendimiento

## 🧪 **Testing**

### **Pruebas de Integración**
```typescript
// Verificar conexión WebSocket
test('should connect to WebSocket server', async () => {
  const socket = io('http://localhost:3000', {
    auth: { token: validJWT }
  });
  
  await new Promise(resolve => socket.on('connect', resolve));
  expect(socket.connected).toBe(true);
});
```

### **Pruebas de Eventos**
```typescript
// Verificar envío de mensaje
test('should send message through WebSocket', async () => {
  socket.emit('send_message', messageData);
  
  await new Promise(resolve => {
    socket.on('new_message', (data) => {
      expect(data.mensaje.contenido).toBe(messageData.contenido);
      resolve();
    });
  });
});
```

## 📚 **Recursos Adicionales**

### **Documentación Oficial**
- [Socket.IO Documentation](https://socket.io/docs/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)

### **Tutoriales Recomendados**
- [Real-time Chat with Socket.IO](https://socket.io/get-started/chat)
- [WebSocket vs REST](https://blog.logrocket.com/websockets-vs-http-apis/)
- [Socket.IO Best Practices](https://socket.io/docs/v4/best-practices/)

---

## 🎉 **¡Sistema de Chat en Tiempo Real Listo!**

El módulo de mensajería ahora incluye **WebSockets con Socket.IO** para comunicación instantánea, manteniendo la persistencia en **MongoDB** y la arquitectura modular existente.

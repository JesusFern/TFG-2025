# Guía del Sistema de Chat - Frontend

Esta guía explica cómo funciona el sistema de chat en el frontend de Nutroos, incluyendo la navegación entre conversaciones y la funcionalidad de chat en vivo.

## Componentes Principales

### 1. ChatPage (`pages/ChatPage.tsx`)
Página principal del chat que orquesta todos los componentes.

**Funcionalidades:**
- Manejo del estado global del chat
- Integración con el hook `useChat`
- Renderizado del sidebar y área principal
- Gestión de conversaciones activas

### 2. ChatSidebar (`organisms/ChatSidebar.tsx`)
Sidebar que muestra la lista de conversaciones del usuario.

**Funcionalidades:**
- Lista de conversaciones del usuario logueado
- Filtros por tipo de conversación
- Búsqueda de conversaciones
- Botón de actualizar conversaciones
- Botón de nueva conversación
- Navegación entre conversaciones

### 3. ChatMain (`organisms/ChatMain.tsx`)
Área principal donde se muestra el chat activo.

**Funcionalidades:**
- Visualización de mensajes de la conversación activa
- Input para enviar mensajes
- Header con información de la conversación
- Integración con WebSocket para mensajes en tiempo real

### 4. ConversationItem (`molecules/ConversationItem.tsx`)
Componente individual para cada conversación en el sidebar.

**Funcionalidades:**
- Muestra información de la conversación
- Preview del último mensaje
- Contador de mensajes no leídos
- Indicador de conversación activa
- Acciones rápidas (archivar, eliminar, etc.)

## Hook useChat

El hook `useChat` es el núcleo del sistema de chat, proporcionando toda la funcionalidad necesaria.

### Estado Principal
```typescript
const {
  conversaciones,           // Lista de conversaciones del usuario
  conversacionActiva,      // Conversación seleccionada actualmente
  mensajes,                // Mensajes de la conversación activa
  isLoading,               // Estado de carga
  error,                   // Errores del sistema
  seleccionarConversacion, // Función para cambiar de conversación
  enviarMensaje,           // Función para enviar mensajes
  refreshConversaciones,   // Función para actualizar conversaciones
  // ... más métodos
} = useChat();
```

### Funcionalidades Principales

#### 1. Carga de Conversaciones
```typescript
// Se ejecuta automáticamente cuando el usuario está autenticado
useEffect(() => {
  if (user?._id) {
    refreshConversaciones();
  }
}, [user?._id]);
```

#### 2. Selección de Conversación
```typescript
const handleSelectConversacion = (conversacionId: string) => {
  seleccionarConversacion(conversacionId);
};
```

#### 3. Envío de Mensajes
```typescript
const handleEnviarMensaje = async (contenido: string) => {
  if (!conversacionActiva) return;
  
  await enviarMensaje({
    conversacionId: conversacionActiva._id,
    contenido,
    tipo: 'texto'
  });
};
```

## Servicio chatService

El servicio maneja todas las comunicaciones con el backend.

### Métodos Principales

#### Obtener Conversaciones del Usuario
```typescript
// Obtiene todas las conversaciones del usuario logueado
const conversaciones = await chatService.conversaciones.obtenerConversacionesUsuario(userId);
```

#### Crear Nueva Conversación
```typescript
const nuevaConversacion = await chatService.conversaciones.crearConversacion({
  participantes: [userId, otroUsuarioId],
  metadata: {
    tipo: 'general'
  }
});
```

#### Enviar Mensaje
```typescript
const mensaje = await chatService.mensajes.crearMensaje({
  conversacionId: conversacionId,
  contenido: 'Hola, ¿cómo estás?',
  tipo: 'texto'
});
```

## Navegación Entre Conversaciones

### Flujo de Navegación

1. **Carga Inicial**: Al entrar al chat, se cargan todas las conversaciones del usuario
2. **Selección**: El usuario hace clic en una conversación del sidebar
3. **Cambio de Contexto**: Se actualiza la conversación activa y se cargan sus mensajes
4. **Actualización en Tiempo Real**: Los mensajes se actualizan automáticamente via WebSocket

### Implementación en el Sidebar

```typescript
// En ChatSidebar.tsx
{conversacionesValidadas.map((conversacion) => (
  <ConversationItem
    key={conversacion._id}
    conversacion={conversacion}
    isActive={conversacionActiva === conversacion._id}
    onClick={() => onSelectConversacion(conversacion._id)}
  />
))}
```

### Implementación en ChatPage

```typescript
// En ChatPage.tsx
<ChatSidebar
  conversaciones={conversaciones}
  conversacionActiva={conversacionActivaId}
  onSelectConversacion={seleccionarConversacion}
  onRefreshConversaciones={refreshConversaciones}
  // ... otras props
/>
```

## Chat en Tiempo Real

### WebSocket Integration

El sistema utiliza WebSocket para mensajes en tiempo real:

```typescript
// En useSocket.ts
const socket = useSocket();

useEffect(() => {
  if (socket) {
    socket.on('nuevo_mensaje', (mensaje) => {
      // Actualizar mensajes en tiempo real
      actualizarMensajes(mensaje);
    });
    
    socket.on('conversacion_actualizada', (conversacion) => {
      // Actualizar lista de conversaciones
      actualizarConversaciones(conversacion);
    });
  }
}, [socket]);
```

### Actualización Automática

- **Nuevos Mensajes**: Se reciben automáticamente via WebSocket
- **Estado de Lectura**: Se actualiza cuando el usuario lee mensajes
- **Contadores**: Se actualizan en tiempo real
- **Último Mensaje**: Se actualiza en la lista de conversaciones

## Filtros y Búsqueda

### Filtros por Tipo
```typescript
const conversacionesPorTipo = {
  todos: conversacionesValidadas,
  general: conversacionesValidadas.filter(c => c.metadata?.tipo === 'general'),
  entrenamiento: conversacionesValidadas.filter(c => c.metadata?.tipo === 'entrenamiento'),
  nutricion: conversacionesValidadas.filter(c => c.metadata?.tipo === 'nutricion'),
  consulta: conversacionesValidadas.filter(c => c.metadata?.tipo === 'consulta')
};
```

### Búsqueda de Texto
```typescript
const conversacionesFiltradas = conversacionesPorTipo[filterTipo].filter(conv => {
  const searchLower = searchTerm.toLowerCase();
  return (
    conv.participantes.some(p => 
      p.fullName.toLowerCase().includes(searchLower)
    ) ||
    conv.ultimoMensajeContenido?.toLowerCase().includes(searchLower)
  );
});
```

## Estados de Carga y Error

### Estados Principales
```typescript
// Estado de carga
{isLoading && (
  <Center>
    <Loader size="lg" />
    <Text>Cargando conversaciones...</Text>
  </Center>
)}

// Estado de error
{error && (
  <Alert color="red" title="Error">
    {error}
  </Alert>
)}

// Estado vacío
{conversaciones.length === 0 && !isLoading && (
  <Paper p="xl" ta="center" c="dimmed">
    <IconMessage size={48} />
    <Text>No tienes conversaciones activas</Text>
  </Paper>
)}
```

## Acciones de Conversación

### Acciones Disponibles
- **Seleccionar**: Cambiar a la conversación
- **Archivar**: Ocultar conversación de la lista principal
- **Eliminar**: Eliminar conversación permanentemente
- **Pin**: Fijar conversación en la parte superior
- **Silenciar**: Desactivar notificaciones

### Implementación
```typescript
const handleArchiveConversacion = async (conversacionId: string) => {
  try {
    await archivarConversacion(conversacionId);
    // Actualizar lista de conversaciones
    refreshConversaciones();
  } catch (error) {
    console.error('Error al archivar conversación:', error);
  }
};
```

## Responsive Design

### Breakpoints
- **Desktop**: Sidebar + área principal lado a lado
- **Tablet**: Sidebar colapsable
- **Mobile**: Sidebar como overlay

### Implementación
```typescript
const isMobile = useMediaQuery('(max-width: 768px)');

return (
  <Group gap={0} h="100vh">
    {!isMobile && (
      <ChatSidebar
        conversaciones={conversaciones}
        conversacionActiva={conversacionActivaId}
        onSelectConversacion={seleccionarConversacion}
      />
    )}
    
    <ChatMain
      conversacion={conversacionActiva}
      mensajes={mensajes}
      onEnviarMensaje={enviarMensaje}
    />
  </Group>
);
```

## Debugging y Logs

### Logs de Debug
```typescript
// En useChat.ts
console.log('🔍 useChat - Estado actual:', {
  conversaciones: conversaciones.length,
  conversacionActiva: conversacionActiva?._id,
  mensajes: mensajes.length,
  isLoading,
  error
});

// En chatService.ts
console.log('🔍 chatService: Llamando a obtenerConversacionesUsuario para usuario:', usuarioId);
```

### Información de Estado
- **Número de conversaciones**: Se muestra en el sidebar
- **Estado de carga**: Indicadores visuales
- **Errores**: Alertas informativas
- **WebSocket**: Estado de conexión

## Consideraciones de Rendimiento

### Optimizaciones
- **Lazy Loading**: Solo se cargan conversaciones visibles
- **Debounce**: Búsqueda con delay para evitar llamadas excesivas
- **Memoización**: Componentes optimizados con React.memo
- **Paginación**: Límite en el número de conversaciones cargadas

### Caché
- **Conversaciones**: Se mantienen en estado local
- **Mensajes**: Se cachean por conversación
- **Usuarios**: Información de participantes cacheada

## Testing

### Tests Unitarios
```typescript
// Test de selección de conversación
test('debería seleccionar una conversación correctamente', () => {
  const { result } = renderHook(() => useChat());
  
  act(() => {
    result.current.seleccionarConversacion('conversacion_id');
  });
  
  expect(result.current.conversacionActiva?._id).toBe('conversacion_id');
});
```

### Tests de Integración
- Flujo completo de navegación
- Envío de mensajes
- Actualización en tiempo real
- Manejo de errores

## Configuración

### Variables de Entorno
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### Configuración de WebSocket
```typescript
// En config/socket.ts
export const socketConfig = {
  url: import.meta.env.VITE_WS_URL,
  options: {
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  }
};
```

## Troubleshooting

### Problemas Comunes

1. **Conversaciones no se cargan**
   - Verificar autenticación del usuario
   - Revisar logs del backend
   - Comprobar endpoint `/api/messaging/conversaciones/by-user/:usuarioId`

2. **Mensajes no aparecen en tiempo real**
   - Verificar conexión WebSocket
   - Revisar configuración de socket
   - Comprobar eventos del servidor

3. **Errores de autorización**
   - Verificar token JWT
   - Comprobar middleware de autenticación
   - Revisar permisos del usuario

### Debugging
```typescript
// Habilitar logs detallados
localStorage.setItem('debug', 'chat:*');

// Verificar estado del WebSocket
console.log('Socket state:', socket?.connected);
```

## Próximas Mejoras

- **Notificaciones push**: Integración con service workers
- **Archivos adjuntos**: Soporte para imágenes y documentos
- **Emojis**: Selector de emojis integrado
- **Búsqueda avanzada**: Filtros por fecha y contenido
- **Exportación**: Exportar conversaciones a PDF
- **Temas**: Modo oscuro/claro
- **Accesibilidad**: Mejoras para lectores de pantalla

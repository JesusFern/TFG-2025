# Sistema de Mensajería - Modelos de Datos

Este directorio contiene los modelos de datos para el sistema de mensajería interna de la aplicación Nutroos.

## Modelos Implementados

### 1. Mensaje (`mensaje.ts`)
Modelo principal para los mensajes individuales del sistema.

**Características:**
- **Remitente y Destinatario**: Referencias a usuarios del sistema
- **Contenido**: Texto del mensaje (máximo 5000 caracteres)
- **Tipos**: texto, imagen, archivo, sistema
- **Estados**: enviado, entregado, leído, archivado
- **Prioridades**: baja, normal, alta, urgente
- **Categorías**: general, entrenamiento, nutrición, consulta, recordatorio
- **Adjuntos**: Archivos e imágenes con metadatos
- **Metadata**: Enlaces a planes de entrenamiento, dietas y sesiones
- **Respuestas**: Sistema de respuestas a mensajes específicos
- **Programación**: Envío programado y expiración de mensajes

**Métodos:**
- `marcarComoLeido()`: Marca el mensaje como leído
- `archivar()`: Archiva el mensaje
- `obtenerConversacion()`: Obtiene conversación entre dos usuarios
- `obtenerNoLeidos()`: Obtiene mensajes no leídos de un usuario

### 2. Conversación (`conversacion.ts`)
Modelo para agrupar mensajes entre usuarios y mantener el contexto.

**Características:**
- **Participantes**: Lista de usuarios en la conversación
- **Último Mensaje**: Referencia y preview del último mensaje
- **Contador de No Leídos**: Por usuario participante
- **Metadata**: Tipo de conversación y enlaces a recursos
- **Configuración**: Notificaciones, sonido y recordatorios
- **Estado**: Activa/inactiva

**Métodos:**
- `obtenerOtroParticipante()`: Obtiene el otro participante
- `incrementarMensajesNoLeidos()`: Incrementa contador de no leídos
- `resetearMensajesNoLeidos()`: Resetea contador de no leídos
- `actualizarUltimoMensaje()`: Actualiza información del último mensaje
- `encontrarOCrear()`: Encuentra o crea conversación entre usuarios
- `obtenerConversacionesUsuario()`: Obtiene conversaciones de un usuario

### 3. Notificación (`notificacion.ts`)
Modelo para las notificaciones del sistema generadas por mensajes y eventos.

**Características:**
- **Tipos**: mensaje, recordatorio, sistema, entrenamiento, nutrición
- **Prioridades**: baja, normal, alta, urgente
- **Acciones**: Navegación y apertura de recursos
- **Metadata**: Enlaces a mensajes, conversaciones y recursos
- **Programación**: Envío programado y expiración
- **Estado**: Leída/no leída, enviada/no enviada

**Métodos:**
- `marcarComoLeida()`: Marca la notificación como leída
- `marcarComoEnviada()`: Marca la notificación como enviada
- `obtenerNoLeidas()`: Obtiene notificaciones no leídas
- `obtenerProgramadas()`: Obtiene notificaciones programadas
- `limpiarExpiradas()`: Elimina notificaciones expiradas
- `crearNotificacionMensaje()`: Crea notificación para nuevo mensaje

## Índices de Base de Datos

### Mensaje
- `remitente + createdAt`: Para consultas por remitente
- `destinatario + createdAt`: Para consultas por destinatario
- `remitente + destinatario + createdAt`: Para conversaciones
- `estado + createdAt`: Para mensajes por estado
- `categoria + createdAt`: Para mensajes por categoría
- `prioridad + createdAt`: Para mensajes por prioridad
- `programadoPara`: Para mensajes programados
- `expiraEn`: Para mensajes con expiración

### Conversación
- `participantes`: Para búsqueda por participantes
- `ultimoMensajeFecha`: Para ordenar por actividad
- `activa + ultimoMensajeFecha`: Para conversaciones activas
- `metadata.tipo`: Para filtrar por tipo
- `metadata.planEntrenamiento`: Para conversaciones de entrenamiento
- `metadata.dieta`: Para conversaciones de nutrición

### Notificación
- `usuario + leida + createdAt`: Para notificaciones por usuario
- `usuario + tipo + createdAt`: Para notificaciones por tipo
- `usuario + prioridad + createdAt`: Para notificaciones por prioridad
- `programadaPara + enviada`: Para notificaciones programadas
- `expiraEn`: Para notificaciones con expiración
- `tipo + createdAt`: Para notificaciones por tipo global

## Validaciones y Middleware

### Mensaje
- **Validación de remitente/destinatario**: No puede enviar mensajes a sí mismo
- **Validación de adjuntos**: Los mensajes de tipo imagen deben tener adjuntos de imagen
- **Límite de contenido**: Máximo 5000 caracteres

### Conversación
- **Validación de participantes**: Mínimo 2 participantes
- **Participantes únicos**: No puede haber duplicados
- **Tamaño de participantes**: Exactamente 2 para conversaciones 1-1

### Notificación
- **Validación de fechas**: Fechas programadas y de expiración válidas
- **Relación de fechas**: Expiración debe ser posterior a programación

## Relaciones con Otros Modelos

- **User**: Remitentes y destinatarios de mensajes
- **PlanEntrenamiento**: Metadata de conversaciones y mensajes
- **Dieta**: Metadata de conversaciones y mensajes
- **Sesion**: Metadata de mensajes y notificaciones

## Uso en el Frontend

Los modelos están diseñados para trabajar con componentes React que utilizan Mantine:

- **ChatMessage**: Componente para mostrar mensajes individuales
- **ConversationList**: Lista de conversaciones del usuario
- **MessageInput**: Input para escribir y enviar mensajes

## Consideraciones de Rendimiento

- **Índices optimizados**: Para consultas frecuentes de conversaciones y mensajes
- **Población selectiva**: Solo se cargan los campos necesarios
- **Paginación**: Límites en consultas para evitar sobrecarga
- **Caché de conversaciones**: Último mensaje y contadores en tiempo real

## Seguridad

- **Validación de usuarios**: Solo usuarios autenticados pueden enviar mensajes
- **Autorización**: Los usuarios solo pueden ver mensajes donde participan
- **Sanitización**: El contenido se valida antes de almacenar
- **Límites de archivos**: Tamaño máximo y tipos permitidos para adjuntos

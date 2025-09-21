# Sistema de Citas - Frontend

Este directorio contiene todos los componentes y funcionalidades relacionadas con el sistema de citas virtuales del frontend.

## Estructura de Archivos

### Tipos TypeScript

- `../types/citas.ts` - Definiciones de tipos e interfaces para citas

### Servicios

- `../services/citaService.ts` - Servicio para comunicación con la API de citas

### Componentes de Formularios

- `FormularioCrearCita.tsx` - Formulario para crear nuevas citas
- `FormularioEditarCita.tsx` - Formulario para editar citas existentes

### Componentes Moleculares

- `../molecules/CitaCard.tsx` - Tarjeta para mostrar información de una cita
- `../molecules/EstadisticasCitas.tsx` - Componente para mostrar estadísticas de citas
- `../molecules/FiltrosCitas.tsx` - Componente de filtros para búsqueda de citas
- `../molecules/ModalCancelarCita.tsx` - Modal para cancelar citas
- `../molecules/ModalReagendarCita.tsx` - Modal para reagendar citas
- `../molecules/ModalConfirmarAccionCita.tsx` - Modal para confirmar acciones de citas

### Páginas

- `../pages/CitasPage.tsx` - Página principal de listado de citas
- `../pages/CrearCitaPage.tsx` - Página para crear nuevas citas
- `../pages/EditarCitaPage.tsx` - Página para editar citas existentes

## Funcionalidades Implementadas

### Para Clientes

- ✅ Crear nuevas citas con profesionales
- ✅ Ver todas sus citas programadas
- ✅ Editar citas (si es posible según estado y fecha)
- ✅ Cancelar citas con motivo
- ✅ Reagendar citas
- ✅ Unirse a videollamadas (preparado para integración futura)
- ✅ Ver estadísticas de sus citas

### Para Profesionales

- ✅ Ver todas las citas con sus clientes
- ✅ Confirmar citas pendientes
- ✅ Marcar citas como completadas
- ✅ Cancelar citas con motivo
- ✅ Reagendar citas
- ✅ Ver estadísticas de citas
- ✅ Unirse a videollamadas (preparado para integración futura)

### Para Administradores

- ✅ Ver todas las citas del sistema
- ✅ Gestionar citas de cualquier usuario
- ✅ Ver estadísticas globales

## Tipos de Citas Soportados

1. **Seguimiento** - Seguimiento del progreso y ajustes
2. **Consulta Nutricional** - Evaluación y plan nutricional
3. **Consulta de Entrenamiento** - Plan de ejercicios y rutinas
4. **Evaluación** - Evaluación inicial o de progreso
5. **Revisión** - Revisión de planes y ajustes

## Estados de Citas

- **Pendiente** - Cita creada, esperando confirmación del profesional
- **Confirmada** - Cita confirmada por el profesional
- **En Progreso** - Cita en curso
- **Completada** - Cita finalizada
- **Cancelada** - Cita cancelada
- **Reagendada** - Cita reagendada (se crea una nueva)

## Validaciones Implementadas

### Fechas y Horarios

- No se pueden crear citas en el pasado
- No se pueden crear citas más de 3 meses en el futuro
- Validación de horarios disponibles según profesional
- No se permiten conflictos de horarios

### Permisos

- Los clientes solo pueden crear/editar sus propias citas
- Los profesionales solo pueden gestionar citas donde son el profesional
- Los administradores tienen acceso completo

### Estados

- No se pueden editar citas completadas o canceladas
- Solo se pueden cancelar/reagendar citas futuras
- Solo los profesionales pueden confirmar/completar citas

## Integración con Backend

El sistema está completamente integrado con la API de citas del backend:

- **GET** `/api/citas` - Obtener citas con filtros
- **POST** `/api/citas` - Crear nueva cita
- **GET** `/api/citas/:id` - Obtener cita específica
- **PUT** `/api/citas/:id` - Actualizar cita
- **POST** `/api/citas/:id/cancelar` - Cancelar cita
- **POST** `/api/citas/:id/reagendar` - Reagendar cita
- **POST** `/api/citas/:id/confirmar` - Confirmar cita
- **POST** `/api/citas/:id/completar` - Completar cita
- **GET** `/api/citas/disponibilidad/:profesionalId` - Obtener disponibilidad
- **GET** `/api/citas/estadisticas` - Obtener estadísticas

## Navegación Integrada

- **Dashboard** - Tarjeta "Mis Citas" con acceso directo
- **Header** - Enlace "Mis Citas" en el menú de usuario
- **Rutas**:
  - `/citas` - Lista de citas
  - `/citas/crear` - Crear nueva cita
  - `/citas/editar/:id` - Editar cita existente

## Características de UX/UI

- **Diseño Responsivo** - Compatible con dispositivos móviles
- **Tema Oscuro/Claro** - Soporte completo para ambos temas
- **Notificaciones** - Feedback visual para todas las acciones
- **Loading States** - Indicadores de carga durante operaciones
- **Validación en Tiempo Real** - Validación de formularios en vivo
- **Filtros Avanzados** - Sistema de filtros para búsqueda eficiente
- **Estadísticas Visuales** - Gráficos y métricas para seguimiento

## Próximas Funcionalidades

- [ ] Integración completa con sistema de videollamadas
- [ ] Notificaciones push para recordatorios
- [ ] Calendario integrado
- [ ] Historial de citas completadas
- [ ] Sistema de calificaciones post-cita
- [ ] Integración con calendario externo (Google, Outlook)
- [ ] Notificaciones por email/SMS
- [ ] Chat integrado en citas

## Consideraciones Técnicas

- **Estado Global** - Uso de React hooks para manejo de estado
- **Optimización** - Lazy loading y paginación para grandes volúmenes
- **Accesibilidad** - Componentes accesibles con ARIA labels
- **Performance** - Debouncing en filtros y búsquedas
- **Error Handling** - Manejo robusto de errores con fallbacks
- **TypeScript** - Tipado fuerte para mayor seguridad de tipos

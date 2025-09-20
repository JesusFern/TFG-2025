# Módulo de Citas

Este módulo gestiona las citas entre clientes y profesionales (entrenadores/nutricionistas) en el sistema Nutroos.

## Modelos

### Cita

Modelo principal que representa una cita entre un cliente y un profesional.

**Campos principales:**

- `cliente`: Referencia al usuario cliente
- `profesional`: Referencia al usuario profesional (worker)
- `tipo`: Tipo de cita (seguimiento, consulta_nutricion, consulta_entrenamiento, evaluacion, revision)
- `estado`: Estado actual de la cita (pendiente, confirmada, en_progreso, completada, cancelada, reagendada)
- `fecha`: Fecha de la cita
- `hora`: Hora de la cita (formato HH:MM)
- `duracion`: Duración en minutos (15-480)
- `motivo`: Motivo de la cita (10-500 caracteres)
- `motivoCancelacion`: Motivo de cancelación (opcional, max 500 caracteres)
- `reagendadaDesde`: ID de la cita original si fue reagendada

**Nota**: Todas las citas son virtuales y utilizan el sistema de videollamadas integrado.

## Servicios

### citaService.ts

Contiene toda la lógica de negocio para la gestión de citas:

- `crearCitaService()`: Crear una nueva cita
- `obtenerCitasService()`: Obtener citas con filtros
- `obtenerCitaPorIdService()`: Obtener una cita específica
- `actualizarCitaService()`: Actualizar una cita existente
- `cancelarCitaService()`: Cancelar una cita
- `reagendarCitaService()`: Reagendar una cita
- `confirmarCitaService()`: Confirmar una cita (solo profesional)
- `completarCitaService()`: Completar una cita (solo profesional)
- `obtenerDisponibilidadProfesionalService()`: Obtener disponibilidad de un profesional
- `obtenerEstadisticasCitasService()`: Obtener estadísticas de citas

## Controladores

### citaController.ts

Maneja las peticiones HTTP para el módulo de citas:

- `POST /api/citas` - Crear cita
- `GET /api/citas` - Obtener citas con filtros
- `GET /api/citas/estadisticas` - Obtener estadísticas
- `GET /api/citas/:id` - Obtener cita por ID
- `PUT /api/citas/:id` - Actualizar cita
- `POST /api/citas/:id/cancelar` - Cancelar cita
- `POST /api/citas/:id/reagendar` - Reagendar cita
- `POST /api/citas/:id/confirmar` - Confirmar cita
- `POST /api/citas/:id/completar` - Completar cita
- `GET /api/citas/disponibilidad/:profesionalId` - Obtener disponibilidad

## Validadores

### citaValidators.ts

Contiene todas las validaciones para los endpoints de citas:

- Validación de datos de entrada
- Verificación de permisos
- Validación de horarios y fechas
- Verificación de conflictos de horarios

## Reglas de Negocio

1. **Asignación**: Solo se pueden crear citas con profesionales asignados al cliente
2. **Horarios**: No se pueden crear citas en el pasado ni más de 3 meses en el futuro
3. **Conflictos**: No se pueden crear citas que se solapen con otras citas del mismo profesional
4. **Estados**: Las citas siguen un flujo de estados específico
5. **Permisos**: Cada acción tiene restricciones de permisos según el rol del usuario
6. **Disponibilidad**: Se respeta la disponibilidad del profesional (campo `availability` en User)

## Flujo de Estados

1. **pendiente** → **confirmada** (por el profesional)
2. **confirmada** → **en_progreso** (cuando inicia la cita)
3. **en_progreso** → **completada** (por el profesional)
4. Cualquier estado → **cancelada** (por cliente o profesional)
5. Cualquier estado → **reagendada** (se crea nueva cita)

## Notas Técnicas

- Se utilizan índices compuestos para optimizar consultas
- Validación de conflictos de horarios en el middleware pre-save
- Métodos de instancia para verificar estados de la cita
- Manejo de errores específicos para cada operación
- Logging detallado para auditoría

# Tests del Módulo de Citas

Este directorio contiene los tests para el módulo de citas del sistema Nutroos.

## Estructura de Tests

### 1. `cita.test.ts`

Tests unitarios para los endpoints de la API de citas:

- **POST /api/citas** - Crear cita
- **GET /api/citas** - Obtener citas con filtros
- **GET /api/citas/:id** - Obtener cita por ID
- **PUT /api/citas/:id** - Actualizar cita
- **POST /api/citas/:id/cancelar** - Cancelar cita
- **POST /api/citas/:id/reagendar** - Reagendar cita
- **POST /api/citas/:id/confirmar** - Confirmar cita
- **POST /api/citas/:id/completar** - Completar cita
- **GET /api/citas/disponibilidad/:profesionalId** - Obtener disponibilidad
- **GET /api/citas/estadisticas** - Obtener estadísticas

### 2. `citaIntegration.test.ts`

Tests de integración que prueban flujos completos:

- **Flujo completo**: Crear → Confirmar → Completar
- **Flujo de cancelación**: Crear → Cancelar
- **Flujo de reagendación**: Crear → Reagendar
- **Filtros y búsquedas**: Por estado, tipo, fechas
- **Permisos y autorización**: Cliente vs Profesional vs Admin

## Características de los Tests

### Mocks Implementados

- **Autenticación**: Simula diferentes roles (cliente, profesional, admin)
- **Modelo User**: Mock del modelo de usuarios con diferentes roles
- **Modelo Cita**: Mock del modelo de citas con estado persistente
- **Logger**: Mock del sistema de logging

### Casos de Prueba Cubiertos

- ✅ Creación de citas con datos válidos
- ✅ Validación de campos requeridos
- ✅ Validación de tipos de cita
- ✅ Validación de duración (15-480 minutos)
- ✅ Validación de fechas (no en el pasado)
- ✅ Filtros por estado, tipo, fechas
- ✅ Flujos completos de citas
- ✅ Permisos y autorización
- ✅ Manejo de errores
- ✅ Estadísticas y disponibilidad

### Flujos de Estados Probados

1. **pendiente** → **confirmada** → **completada**
2. **pendiente** → **cancelada**
3. **pendiente** → **reagendada** (nueva cita)

## Ejecutar Tests

```bash
# Ejecutar todos los tests de citas
npm test -- --testPathPattern=tests/citas

# Ejecutar test específico
npm test -- --testPathPattern=tests/citas/cita.test.ts

# Ejecutar tests de integración
npm test -- --testPathPattern=tests/citas/citaIntegration.test.ts

```

## Cobertura de Tests

Los tests cubren:

- **Endpoints**: 100% de los endpoints de la API
- **Flujos**: Todos los flujos principales de citas
- **Validaciones**: Todas las validaciones de datos
- **Permisos**: Todos los casos de autorización
- **Errores**: Manejo de errores y casos edge

## Notas Técnicas

- Los tests usan mocks para simular la base de datos
- Se mantiene estado persistente en los tests de integración
- Se prueban diferentes roles de usuario
- Se validan respuestas HTTP y estructura de datos
- Se incluyen casos de error y validación

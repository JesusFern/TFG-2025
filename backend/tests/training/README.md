# Tests del Módulo de Entrenamiento

Este directorio contiene todos los tests para el módulo de entrenamiento de la aplicación, siguiendo la misma estructura que los tests existentes de `user.test.ts`, `worker.test.ts` y `diet.test.ts`.

## Estructura de Tests

### 1. `ejercicio.test.ts`
Tests unitarios para el módulo de ejercicios:
- ✅ Crear ejercicio
- ✅ Obtener ejercicios (con filtros)
- ✅ Obtener ejercicio por ID
- ✅ Actualizar ejercicio
- ✅ Eliminar ejercicio (soft delete)
- ✅ Validaciones de campos (enums, tipos, etc.)

### 2. `planEntrenamiento.test.ts`
Tests unitarios para el módulo de planes de entrenamiento:
- ✅ Crear plan de entrenamiento
- ✅ Obtener planes (con filtros)
- ✅ Obtener plan por ID
- ✅ Actualizar plan
- ✅ Eliminar plan (soft delete)
- ✅ Asignar cliente al plan
- ✅ Remover cliente del plan
- ✅ Validaciones de negocio

### 3. `sesion.test.ts`
Tests unitarios para el módulo de sesiones:
- ✅ Crear sesión
- ✅ Obtener sesiones (con filtros)
- ✅ Obtener sesión por ID
- ✅ Actualizar sesión
- ✅ Eliminar sesión
- ✅ Marcar sesión como completada
- ✅ Agregar notas a sesión
- ✅ Validaciones de fecha y ejercicios

### 4. `trainingIntegration.test.ts`
Tests de integración que prueban el flujo completo:
- ✅ Flujo completo: ejercicio → plan → sesión
- ✅ Gestión de clientes en planes
- ✅ Estados de sesiones
- ✅ Consultas y filtros integrados
- ✅ Validaciones de integridad
- ✅ Operaciones de eliminación
- ✅ Manejo de errores

## Ejecución de Tests

### Ejecutar todos los tests de entrenamiento:
```bash
npm run test:training
```

### Ejecutar tests específicos:

#### Solo ejercicios:
```bash
npm run test:training:ejercicios
```

#### Solo planes de entrenamiento:
```bash
npm run test:training:planes
```

#### Solo sesiones:
```bash
npm run test:training:sesiones
```

#### Solo tests de integración:
```bash
npm run test:training:integration
```

### Ejecutar todos los tests de la aplicación:
```bash
npm test
```

## Características de los Tests

### Mocks Implementados
- **Middleware de autenticación**: Simula usuarios autenticados con roles específicos
- **Modelos de base de datos**: Simula operaciones CRUD sin conexión real
- **Servicios**: Simula lógica de negocio para testing aislado
- **Validadores**: Simula validaciones de entrada

#### Guía práctica de mocks

- Autenticación (`authMiddleware`):
  - Por defecto se simula un usuario con rol `worker`.
  - En el test de integración, para endpoints de sesiones de cliente (completar y notas) el mock asigna `role=user` y `id=clienteId` cuando la URL termina en `/completar` o `/notas`.

- Modelos Mongoose (patrón de mock):
  - Métodos encadenables: los mocks de `find()` devuelven un objeto con `populate()` y `sort()` que retornan `this` o el resultado esperado.
  - `findById()` devuelve un “documento” que implementa `populate()` y, cuando es necesario, también `save()` para simular actualizaciones (p. ej. marcar sesión completada).
  - En integración se usa un pequeño “store” en memoria (Map) para simular `save()`, lectura por `_id` y soft deletes.

- Servicios de sesiones (en `sesion.test.ts`):
  - `crearSesionService` valida fecha (rechaza fechas anteriores al día actual) y órdenes duplicadas en ejercicios, lanzando errores con los mensajes que esperan los tests.
  - `obtenerSesionesService` devuelve una lista con una sesión de ejemplo para permitir filtros y listados.
  - `obtenerSesionPorIdService` lanza error si el ID no coincide con el de prueba.
  - `actualizarSesionService`, `eliminarSesionService`, `marcarSesionCompletadaService` y `agregarNotasSesionService` devuelven objetos consistentes con lo que validan los controladores.

- Rutas de planes (clientes):
  - Los tests usan `POST /api/training/planes/:id/clientes` para asignar clientes y `DELETE /api/training/planes/:id/clientes/:clienteId` para removerlos.

Importante: declara los `jest.mock(...)` ANTES de importar `app` desde `src/server` para que Jest aplique los mocks correctamente al gráfico de dependencias.

### Cobertura de Testing
- ✅ **Endpoints CRUD**: Todos los endpoints están cubiertos
- ✅ **Validaciones**: Campos requeridos, tipos, enums, rangos
- ✅ **Lógica de negocio**: Reglas de validación específicas del dominio
- ✅ **Manejo de errores**: Casos de error y respuestas apropiadas
- ✅ **Autorización**: Verificación de roles y permisos
- ✅ **Integridad de datos**: Relaciones entre entidades

### Casos de Prueba Incluidos
- **Casos exitosos**: Operaciones que deberían funcionar correctamente
- **Casos de error**: Datos inválidos, permisos insuficientes, etc.
- **Casos edge**: Límites de validación, datos extremos
- **Flujos completos**: Secuencias de operaciones relacionadas

## Configuración

Los tests utilizan la configuración estándar de Jest definida en `jest.config.ts` y el setup común en `tests/setup.ts`.

### Variables de Entorno
- `NODE_ENV=test`: Configura el entorno de testing
- Base de datos de testing separada (si se configura)

### Dependencias de Testing
- **Jest**: Framework de testing
- **Supertest**: Testing de endpoints HTTP
- **Mongoose**: Simulación de operaciones de base de datos
- **TypeScript**: Soporte completo para tipos

## Mantenimiento

### Agregar Nuevos Tests
1. Crear archivo `.test.ts` en el directorio apropiado
2. Seguir la estructura de mocks existente
3. Agregar tests para nuevos endpoints o funcionalidades
4. Actualizar este README si es necesario

### Actualizar Tests Existentes
1. Mantener compatibilidad con la estructura de mocks
2. Actualizar casos de prueba cuando cambie la lógica de negocio
3. Verificar que todos los tests pasen después de cambios

### Debugging
Para debuggear tests específicos:
```bash
# Ejecutar un test específico con más detalle
npm run test:training:ejercicios -- --verbose

# Ejecutar tests con coverage
npm run test:training -- --coverage
```

## Notas Importantes

- Los tests están diseñados para ser **independientes** y **aislados**
- Cada test limpia su estado antes de ejecutarse
- Los mocks simulan el comportamiento real sin dependencias externas
- Los tests verifican tanto la funcionalidad como la validación de datos
- Se incluyen tests para casos de error y edge cases

## Contribución

Al agregar nuevos tests o modificar existentes:
1. Mantener la consistencia con el estilo existente
2. Incluir casos de prueba para nuevos escenarios
3. Documentar cambios significativos
4. Verificar que todos los tests pasen antes de hacer commit

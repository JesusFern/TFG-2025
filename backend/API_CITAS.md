# API de Citas - Documentación

## Endpoints Disponibles

### 1. Crear Cita
**POST** `/api/citas`

**Body:**
```json
{
  "cliente": "string (ObjectId)",
  "profesional": "string (ObjectId)",
  "tipo": "seguimiento | consulta_nutricion | consulta_entrenamiento | evaluacion | revision",
  "fecha": "string (ISO 8601)",
  "hora": "string (HH:MM)",
  "duracion": "number (15-480, opcional, default: 60)",
  "motivo": "string (10-500 caracteres)"
}
```

### 2. Obtener Citas
**GET** `/api/citas`

**Query Parameters:**
- `cliente`: ObjectId (opcional)
- `profesional`: ObjectId (opcional)
- `tipo`: string (opcional)
- `estado`: string (opcional)
- `fechaDesde`: string (ISO 8601, opcional)
- `fechaHasta`: string (ISO 8601, opcional)
- `limit`: number (1-100, opcional, default: 20)
- `offset`: number (opcional, default: 0)

### 3. Obtener Estadísticas
**GET** `/api/citas/estadisticas`

### 4. Obtener Cita por ID
**GET** `/api/citas/:id`

### 5. Actualizar Cita
**PUT** `/api/citas/:id`

**Body:** (todos los campos opcionales)
```json
{
  "tipo": "string",
  "fecha": "string (ISO 8601)",
  "hora": "string (HH:MM)",
  "duracion": "number",
  "motivo": "string",
  "estado": "string"
}
```

### 6. Cancelar Cita
**POST** `/api/citas/:id/cancelar`

**Body:**
```json
{
  "motivo": "string (5-500 caracteres)"
}
```

### 7. Reagendar Cita
**POST** `/api/citas/:id/reagendar`

**Body:**
```json
{
  "nuevaFecha": "string (ISO 8601)",
  "nuevaHora": "string (HH:MM)",
  "motivo": "string (opcional, max 500 caracteres)"
}
```

### 8. Confirmar Cita
**POST** `/api/citas/:id/confirmar`

*Solo el profesional puede confirmar*

### 9. Completar Cita
**POST** `/api/citas/:id/completar`

*Solo el profesional puede completar*

### 10. Obtener Disponibilidad
**GET** `/api/citas/disponibilidad/:profesionalId?fecha=YYYY-MM-DD`

## Códigos de Respuesta

- `200`: Operación exitosa
- `201`: Recurso creado exitosamente
- `400`: Error de validación o datos inválidos
- `401`: No autenticado
- `403`: Sin permisos para la operación
- `404`: Recurso no encontrado
- `409`: Conflicto (ej: horario ocupado)
- `500`: Error interno del servidor

## Autenticación

Todos los endpoints requieren autenticación mediante JWT token en el header:
```
Authorization: Bearer <token>
```

## Permisos

- **Clientes**: Pueden crear, ver, cancelar y reagendar sus propias citas
- **Profesionales**: Pueden ver, actualizar, confirmar y completar citas de sus clientes asignados
- **Administradores**: Acceso completo a todas las operaciones

## Validaciones Importantes

1. **Fechas**: No se pueden crear citas en el pasado ni más de 3 meses en el futuro
2. **Horarios**: Formato HH:MM, no se permiten conflictos de horarios
3. **Asignación**: Solo se pueden crear citas con profesionales asignados al cliente
4. **Estados**: Las citas siguen un flujo de estados específico
5. **Duración**: Entre 15 y 480 minutos (1-8 horas)
6. **Todas las citas son virtuales**: Se utilizará el sistema de videollamadas integrado

## Ejemplos de Uso

### Crear una cita de seguimiento virtual
```bash
curl -X POST http://localhost:5000/api/citas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "64a1b2c3d4e5f6789012345",
    "profesional": "64a1b2c3d4e5f6789012346",
    "tipo": "seguimiento",
    "fecha": "2024-02-15",
    "hora": "10:00",
    "duracion": 60,
    "motivo": "Seguimiento semanal del progreso"
  }'
```

### Obtener citas del cliente
```bash
curl -X GET "http://localhost:5000/api/citas?cliente=64a1b2c3d4e5f6789012345" \
  -H "Authorization: Bearer <token>"
```

### Confirmar una cita (profesional)
```bash
curl -X POST http://localhost:5000/api/citas/64a1b2c3d4e5f6789012347/confirmar \
  -H "Authorization: Bearer <token>"
```

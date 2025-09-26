import request from 'supertest';
import app from '../../src/server';
import mongoose from 'mongoose';
import User from '../../src/models/users/user';
import Ejercicio from '../../src/models/training/ejercicio';
import Sesion from '../../src/models/training/sesion';
import { TokenService } from '../../src/utils/tokenService';

describe('Registro de Ejercicios', () => {
  let clienteToken: string;
  let clienteId: string;
  let entrenadorId: string;
  let ejercicioId: string;
  let sesionId: string;

  beforeEach(async () => {
    // Crear cliente con email único
    const timestamp = Date.now();
    const cliente = new User({
      fullName: 'Cliente Test',
      email: `cliente${timestamp}@test.com`,
      password: 'password123',
      role: 'user',
      gender: 'Masculino',
      birthDate: new Date('1990-01-01'),
      phoneNumber: `+34612345678`
    });
    await cliente.save();
    clienteId = (cliente._id as mongoose.Types.ObjectId).toString();
    clienteToken = TokenService.generateToken({ id: clienteId, role: 'user' });

    // Crear entrenador con email único
    const entrenador = new User({
      fullName: 'Entrenador Test',
      email: `entrenador${timestamp}@test.com`,
      password: 'password123',
      role: 'worker',
      workerType: 'Entrenador personal',
      biography: 'Entrenador profesional con 5 años de experiencia',
      availability: 'Lunes a Viernes 8:00-18:00',
      birthDate: new Date('1985-01-01'),
      phoneNumber: `+34698765432`
    });
    await entrenador.save();
    entrenadorId = (entrenador._id as mongoose.Types.ObjectId).toString();
    // entrenadorToken = TokenService.generateToken({ id: entrenadorId, role: 'worker' });

    // Crear ejercicio con nombre único
    const ejercicio = new Ejercicio({
      nombre: `Press de banca ${timestamp}`,
      slug: `press-banca-${timestamp}`,
      descripcion: 'Ejercicio para pecho',
      grupoMuscular: 'Pecho',
      equipamiento: 'Barra',
      nivelDificultad: 'Intermedio',
      tipoEjercicio: 'Fuerza',
      creador: entrenadorId,
      publico: true,
      activo: true
    });
    await ejercicio.save();
    ejercicioId = (ejercicio._id as mongoose.Types.ObjectId).toString();

    // Crear sesión
    const sesion = new Sesion({
      fecha: new Date(),
      tipoEntrenamiento: 'Fuerza',
      duracion: 60,
      ejercicios: [{
        ejercicio: ejercicioId,
        orden: 1,
        series: 3,
        repeticiones: 10,
        peso: 80,
        tiempoDescanso: 120,
        nivelIntensidad: 'Media'
      }],
      entrenador: entrenadorId,
      cliente: clienteId
    });
    await sesion.save();
    sesionId = (sesion._id as mongoose.Types.ObjectId).toString();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/training/registros', () => {
    it('debería crear un registro de ejercicio exitosamente', async () => {
      const registroData = {
        ejercicio: ejercicioId,
        sesion: sesionId,
        cargaUtilizada: 80,
        repeticionesRealizadas: 10,
        seriesCompletadas: 3,
        nivelEsfuerzo: 8,
        notas: 'Ejercicio completado correctamente',
        tiempoDescanso: 120,
        duracionEjercicio: 300
      };

      const response = await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(201);

      expect(response.body.message).toBe('Registro de ejercicio creado correctamente');
      expect(response.body.registro).toBeDefined();
      expect(response.body.registro.ejercicio).toBe(ejercicioId);
      expect(response.body.registro.sesion).toBe(sesionId);
      expect(response.body.registro.cargaUtilizada).toBe(80);
      expect(response.body.registro.nivelEsfuerzo).toBe(8);
    });

    it('debería fallar si el ejercicio no está en la sesión', async () => {
      // Crear otro ejercicio que no esté en la sesión
      const otroEjercicio = new Ejercicio({
        nombre: 'Sentadilla',
        slug: 'sentadilla',
        descripcion: 'Ejercicio para piernas',
        grupoMuscular: 'Piernas',
        equipamiento: 'Peso corporal',
        nivelDificultad: 'Principiante',
        tipoEjercicio: 'Fuerza',
        creador: entrenadorId,
        publico: true,
        activo: true
      });
      await otroEjercicio.save();

      const registroData = {
        ejercicio: (otroEjercicio._id as mongoose.Types.ObjectId).toString(),
        sesion: sesionId,
        repeticionesRealizadas: 10,
        seriesCompletadas: 3,
        nivelEsfuerzo: 8
      };

      const response = await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(400);

      expect(response.body.message).toBe('Error al crear registro de ejercicio');
      expect(response.body.error).toContain('El ejercicio no está incluido en esta sesión');
    });

    it('debería fallar si ya existe un registro para el mismo ejercicio', async () => {
      const registroData = {
        ejercicio: ejercicioId,
        sesion: sesionId,
        repeticionesRealizadas: 12,
        seriesCompletadas: 3,
        nivelEsfuerzo: 9
      };

      // Crear primer registro
      await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(201);

      // Guardar el ID del registro creado para limpiarlo después
      // const registroId = response1.body.registro._id;

      // Intentar crear segundo registro con el mismo ejercicio
      const response2 = await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(400);

      expect(response2.body.message).toBe('Error al crear registro de ejercicio');
      expect(response2.body.error).toContain('Ya existe un registro para este ejercicio en esta sesión');
    });

    it('debería fallar si el usuario no está autenticado', async () => {
      const registroData = {
        ejercicio: ejercicioId,
        sesion: sesionId,
        repeticionesRealizadas: 10,
        seriesCompletadas: 3,
        nivelEsfuerzo: 8
      };

      await request(app)
        .post('/api/training/registros')
        .send(registroData)
        .expect(401);
    });
  });

  describe('GET /api/training/registros', () => {
    it('debería obtener registros del cliente autenticado', async () => {
      // Crear un registro primero
      const registroData = {
        ejercicio: ejercicioId,
        sesion: sesionId,
        repeticionesRealizadas: 10,
        seriesCompletadas: 3,
        nivelEsfuerzo: 8
      };

      await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(201);

      // const registroId = createResponse.body.registro._id;

      const response = await request(app)
        .get('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(200);

      expect(response.body.registros).toBeDefined();
      expect(Array.isArray(response.body.registros)).toBe(true);
      expect(response.body.registros.length).toBeGreaterThan(0);
    });

    it('debería filtrar registros por sesión', async () => {
      // Crear un registro primero
      const registroData = {
        ejercicio: ejercicioId,
        sesion: sesionId,
        repeticionesRealizadas: 10,
        seriesCompletadas: 3,
        nivelEsfuerzo: 8
      };

      await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(201);

      const response = await request(app)
        .get(`/api/training/registros?sesion=${sesionId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(200);

      expect(response.body.registros).toBeDefined();
      expect(response.body.registros.length).toBeGreaterThan(0);
      response.body.registros.forEach((registro: { sesion: { _id: string } }) => {
        expect(registro.sesion._id).toBe(sesionId);
      });
    });

    it('debería filtrar registros por ejercicio', async () => {
      // Crear un registro primero
      const registroData = {
        ejercicio: ejercicioId,
        sesion: sesionId,
        repeticionesRealizadas: 10,
        seriesCompletadas: 3,
        nivelEsfuerzo: 8
      };

      await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(201);

      const response = await request(app)
        .get(`/api/training/registros?ejercicio=${ejercicioId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(200);

      expect(response.body.registros).toBeDefined();
      expect(response.body.registros.length).toBeGreaterThan(0);
      response.body.registros.forEach((registro: { ejercicio: { _id: string } }) => {
        expect(registro.ejercicio._id).toBe(ejercicioId);
      });
    });
  });

  describe('GET /api/training/registros/:id', () => {
    it('debería obtener un registro específico', async () => {
      // Crear un registro primero
      const registroData = {
        ejercicio: ejercicioId,
        sesion: sesionId,
        repeticionesRealizadas: 10,
        seriesCompletadas: 3,
        nivelEsfuerzo: 8
      };

      const createResponse = await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(201);

      const registroId = createResponse.body.registro._id;

      const response = await request(app)
        .get(`/api/training/registros/${registroId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(200);

      expect(response.body.registro).toBeDefined();
      expect(response.body.registro._id).toBe(registroId);
    });

    it('debería fallar si el registro no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      
      await request(app)
        .get(`/api/training/registros/${fakeId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/training/registros/:id', () => {
    it('debería actualizar un registro exitosamente', async () => {
      // Crear un registro primero
      const registroData = {
        ejercicio: ejercicioId,
        sesion: sesionId,
        repeticionesRealizadas: 10,
        seriesCompletadas: 3,
        nivelEsfuerzo: 8
      };

      const createResponse = await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(201);

      const registroId = createResponse.body.registro._id;

      const datosActualizacion = {
        repeticionesRealizadas: 12,
        seriesCompletadas: 3,
        nivelEsfuerzo: 9,
        notas: 'Registro actualizado'
      };

      const response = await request(app)
        .put(`/api/training/registros/${registroId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(datosActualizacion)
        .expect(200);

      expect(response.body.message).toBe('Registro de ejercicio actualizado correctamente');
      expect(response.body.registro.repeticionesRealizadas).toBe(12);
      expect(response.body.registro.nivelEsfuerzo).toBe(9);
    });

    it('debería fallar si el registro no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const datosActualizacion = {
        nivelEsfuerzo: 9
      };

      await request(app)
        .put(`/api/training/registros/${fakeId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(datosActualizacion)
        .expect(400);
    });
  });

  describe('PATCH /api/training/registros/:id/completado', () => {
    it('debería marcar un registro como completado', async () => {
      // Crear un registro primero
      const registroData = {
        ejercicio: ejercicioId,
        sesion: sesionId,
        repeticionesRealizadas: 10,
        seriesCompletadas: 3,
        nivelEsfuerzo: 8
      };

      const createResponse = await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(201);

      const registroId = createResponse.body.registro._id;

      const response = await request(app)
        .patch(`/api/training/registros/${registroId}/completado`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(200);

      expect(response.body.message).toBe('Registro marcado como completado correctamente');
      expect(response.body.registro.completado).toBe(true);
    });
  });

  describe('GET /api/training/registros/progreso/:ejercicioId', () => {
    it('debería obtener el progreso de un ejercicio', async () => {
      // Crear un registro primero
      const registroData = {
        ejercicio: ejercicioId,
        sesion: sesionId,
        repeticionesRealizadas: 10,
        seriesCompletadas: 3,
        nivelEsfuerzo: 8
      };

      await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(201);

      const response = await request(app)
        .get(`/api/training/registros/progreso/${ejercicioId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(200);

      expect(response.body.progreso).toBeDefined();
      expect(Array.isArray(response.body.progreso)).toBe(true);
    });
  });

  describe('GET /api/training/registros/verificar-sesion/:sesionId', () => {
    it('debería verificar si una sesión está completa', async () => {
      // Crear un registro primero
      const registroData = {
        ejercicio: ejercicioId,
        sesion: sesionId,
        repeticionesRealizadas: 10,
        seriesCompletadas: 3,
        nivelEsfuerzo: 8
      };

      await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(201);

      const response = await request(app)
        .get(`/api/training/registros/verificar-sesion/${sesionId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(200);

      expect(response.body.sesionCompleta).toBeDefined();
      expect(typeof response.body.sesionCompleta).toBe('boolean');
      expect(response.body.totalEjercicios).toBeDefined();
      expect(response.body.ejerciciosRegistrados).toBeDefined();
    });
  });

  describe('DELETE /api/training/registros/:id', () => {
    it('debería eliminar un registro exitosamente', async () => {
      // Crear un registro primero
      const registroData = {
        ejercicio: ejercicioId,
        sesion: sesionId,
        repeticionesRealizadas: 10,
        seriesCompletadas: 3,
        nivelEsfuerzo: 8
      };

      const createResponse = await request(app)
        .post('/api/training/registros')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(registroData)
        .expect(201);

      const registroId = createResponse.body.registro._id;

      const response = await request(app)
        .delete(`/api/training/registros/${registroId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(200);

      expect(response.body.message).toBe('Registro de ejercicio eliminado correctamente');
    });

    it('debería fallar si el registro no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      
      await request(app)
        .delete(`/api/training/registros/${fakeId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(400);
    });
  });
});

import request from 'supertest';
import app from '../../src/server';
import mongoose from 'mongoose';
import User from '../../src/models/users/user';
import PlanEntrenamiento from '../../src/models/training/planEntrenamiento';
import Sesion from '../../src/models/training/sesion';
import Ejercicio from '../../src/models/training/ejercicio';
import RegistroEjercicio from '../../src/models/training/registroEjercicio';
import { TokenService } from '../../src/utils/tokenService';

describe('Estadísticas API', () => {
  let entrenadorToken: string;
  let clienteToken: string;
  let clienteId: string;
  let entrenadorId: string;
  let planId: string;
  let sesionId: string;
  let ejercicioId: string;

  beforeAll(async () => {
    // Crear entrenador
    const entrenador = new User({
      email: `entrenador${Date.now()}@test.com`,
      password: 'password123',
      fullName: 'Entrenador Test',
      role: 'worker',
      workerType: 'Entrenador personal',
      gender: 'Masculino',
      birthDate: new Date('1990-01-01'),
      phoneNumber: '+34612345678',
      biography: 'Entrenador de prueba',
      availability: 'Lunes a Viernes'
    });
    await entrenador.save();
    entrenadorId = (entrenador._id as mongoose.Types.ObjectId).toString();
    entrenadorToken = TokenService.generateToken({ id: entrenadorId, role: 'worker' });

    // Crear cliente
    const cliente = new User({
      email: `cliente${Date.now()}@test.com`,
      password: 'password123',
      fullName: 'Cliente Test',
      role: 'user',
      gender: 'Masculino',
      birthDate: new Date('1995-01-01'),
      phoneNumber: '+34612345679',
      biography: 'Cliente de prueba'
    });
    await cliente.save();
    clienteId = (cliente._id as mongoose.Types.ObjectId).toString();
    clienteToken = TokenService.generateToken({ id: clienteId, role: 'user' });

    // Crear ejercicio
    const ejercicio = new Ejercicio({
      nombre: 'Press de banca',
      descripcion: 'Ejercicio de pecho',
      tipoEjercicio: 'Fuerza',
      grupoMuscular: 'Pecho',
      equipamiento: 'Barra',
      instrucciones: 'Instrucciones del ejercicio',
      videoUrl: 'https://example.com/video.mp4',
      imagenUrl: 'https://example.com/imagen.jpg',
      nivelDificultad: 'Intermedio',
      slug: 'press-de-banca'
    });
    await ejercicio.save();
    ejercicioId = ejercicio._id.toString();

    // Crear plan de entrenamiento
    const plan = new PlanEntrenamiento({
      nombre: 'Plan Test',
      descripcion: 'Plan de prueba',
      duracionSemanas: 4,
      frecuenciaSemanal: 3,
      entrenador: entrenadorId,
      clientes: [clienteId],
      activo: true,
      fechaInicio: new Date(),
      sesionesPorSemana: 3,
      duracionDias: 28,
      objetivo: 'Ganancia muscular'
    });
    await plan.save();
    planId = plan._id.toString();

    // Crear sesión
    const sesion = new Sesion({
      plan: planId,
      cliente: clienteId,
      entrenador: entrenadorId,
      fecha: new Date(),
      tipo: 'Fuerza',
      tipoEntrenamiento: 'Fuerza',
      duracion: 60,
      ejercicios: [{
        ejercicio: ejercicioId,
        series: 3,
        repeticiones: 10,
        peso: 50,
        tiempoDescanso: 120,
        orden: 1
      }],
      completada: false
    });
    await sesion.save();
    sesionId = sesion._id.toString();

    // Crear registro de ejercicio
    const registro = new RegistroEjercicio({
      ejercicio: ejercicioId,
      sesion: sesionId,
      cliente: clienteId,
      cargaUtilizada: 50,
      repeticionesRealizadas: 10,
      seriesCompletadas: 3,
      nivelEsfuerzo: 7,
      completado: true,
      fecha: new Date()
    });
    await registro.save();
  });

  afterAll(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
  });

  describe('GET /api/estadisticas/cliente/:clienteId', () => {
    it('debería obtener estadísticas del cliente para entrenador', async () => {
      const response = await request(app)
        .get(`/api/estadisticas/cliente/${clienteId}`)
        .set('Authorization', `Bearer ${entrenadorToken}`)
        .expect(200);

      expect(response.body.message).toBe('Estadísticas obtenidas correctamente');
      expect(response.body.estadisticas).toBeDefined();
      expect(response.body.estadisticas.clienteId).toBe(clienteId);
      expect(response.body.estadisticas.asistencia).toBeDefined();
      expect(response.body.estadisticas.progresoEjercicios).toBeDefined();
      expect(response.body.estadisticas.consistencia).toBeDefined();
      expect(response.body.estadisticas.rendimiento).toBeDefined();
    });

    it('debería rechazar acceso para usuario no autorizado', async () => {
      await request(app)
        .get(`/api/estadisticas/cliente/${clienteId}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(403);
    });

    it('debería rechazar acceso sin token', async () => {
      await request(app)
        .get(`/api/estadisticas/cliente/${clienteId}`)
        .expect(401);
    });
  });

  describe('GET /api/estadisticas/mi-progreso', () => {
    it('debería obtener progreso personal del cliente', async () => {
      const response = await request(app)
        .get('/api/estadisticas/mi-progreso')
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(200);

      expect(response.body.message).toBe('Progreso personal obtenido correctamente');
      expect(response.body.estadisticas).toBeDefined();
      expect(response.body.estadisticas.clienteId).toBe(clienteId);
    });

    it('debería rechazar acceso sin token', async () => {
      await request(app)
        .get('/api/estadisticas/mi-progreso')
        .expect(401);
    });
  });

  describe('GET /api/estadisticas/cliente/:clienteId/semanal/:numeroSemana/:año', () => {
    it('debería obtener estadísticas semanales del cliente', async () => {
      const numeroSemana = 1;
      const año = 2024;

      // Primero probemos sin autenticación para ver si el endpoint existe
      const responseNoAuth = await request(app)
        .get(`/api/estadisticas/cliente/${clienteId}/semanal/${numeroSemana}/${año}`);

      console.log('Response without auth status:', responseNoAuth.status);
      console.log('Response without auth body:', responseNoAuth.body);

      const response = await request(app)
        .get(`/api/estadisticas/cliente/${clienteId}/semanal/${numeroSemana}/${año}`)
        .set('Authorization', `Bearer ${entrenadorToken}`);

      console.log('Response status:', response.status);
      console.log('Response body:', response.body);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Estadísticas semanales obtenidas correctamente');
      expect(response.body.estadisticas).toBeDefined();
      expect(response.body.estadisticas.semana.numero).toBe(numeroSemana);
      expect(response.body.estadisticas.asistencia).toBeDefined();
      expect(response.body.estadisticas.progreso).toBeDefined();
      expect(response.body.estadisticas.tendencias).toBeDefined();
    });
  });

  describe('GET /api/estadisticas/cliente/:clienteId/ejercicios', () => {
    it('debería obtener progreso de ejercicios del cliente', async () => {
      const response = await request(app)
        .get(`/api/estadisticas/cliente/${clienteId}/ejercicios`)
        .set('Authorization', `Bearer ${entrenadorToken}`)
        .expect(200);

      expect(response.body.message).toBe('Progreso de ejercicios obtenido correctamente');
      expect(response.body.progreso).toBeDefined();
      expect(Array.isArray(response.body.progreso)).toBe(true);
    });
  });

  describe('GET /api/estadisticas/mi-progreso/ejercicios', () => {
    it('debería obtener progreso personal de ejercicios del cliente', async () => {
      const response = await request(app)
        .get('/api/estadisticas/mi-progreso/ejercicios')
        .set('Authorization', `Bearer ${clienteToken}`)
        .expect(200);

      expect(response.body.message).toBe('Progreso personal de ejercicios obtenido correctamente');
      expect(response.body.progreso).toBeDefined();
      expect(Array.isArray(response.body.progreso)).toBe(true);
    });
  });
});

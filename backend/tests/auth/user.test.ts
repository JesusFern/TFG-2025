import request from 'supertest';
import app from '../../src/server';
import mongoose from 'mongoose';
import User from '../../src/models/users/user';

interface ValidationError {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
}

describe('User Authentication Endpoints', () => {
  beforeAll(async () => {
    // Limpiar la base de datos antes de todas las pruebas
    await User.deleteMany({});
  });

  const testUser = {
    fullName: "Test User",
    email: "testuser@example.com",
    password: "Test1234",
    phoneNumber: "+34123456789",
    gender: "Masculino",
    birthDate: "1990-01-01T00:00:00.000Z"
  };

  const testUserHealth = {
    altura: 175,
    pesoActual: 70,
    objetivoPeso: 65,
    condicionesMedicas: ["Diabetes", "Hipertensión"]
  };

  const testUserActivity = {
    nivelActividad: "Regular",
    frecuenciaEjercicio: 3
  };

  const testUserExercise = {
    tipoEjercicio: ["Cardio", "Musculación"],
    otrosEjercicios: "Yoga ocasional",
    disponibilidad: "Lunes, Miércoles, Viernes",
    objetivo: "Pérdida de peso"
  };

  const testUserNutrition = {
    preferencias: "Vegetariano, Sin gluten",
    comidasDia: 5,
    restricciones: "Sin lactosa",
    alergias: "Frutos secos",
    horariosComidas: [
      { comida: "Desayuno", hora: "08:00" },
      { comida: "Media mañana", hora: "11:00" },
      { comida: "Almuerzo", hora: "14:00" },
      { comida: "Merienda", hora: "17:00" },
      { comida: "Cena", hora: "20:00" }
    ]
  };

  describe('Step-by-Step Registration Validation', () => {
    it('debería validar el paso 0 (datos personales) correctamente', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/0')
        .send({
          fullName: testUser.fullName,
          email: testUser.email,
          password: testUser.password,
          phoneNumber: testUser.phoneNumber,
          gender: testUser.gender,
          birthDate: testUser.birthDate
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Validación del paso 0 exitosa');
    });

    it('debería validar el paso 1 (datos físicos) correctamente', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/1')
        .send({
          ...testUser,
          health: testUserHealth
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Validación del paso 1 exitosa');
    });

    it('debería validar el paso 2 (actividad básica) correctamente', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/2')
        .send({
          ...testUser,
          health: testUserHealth,
          activity: testUserActivity
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Validación del paso 2 exitosa');
    });

    it('debería validar el paso 3 (ejercicio) correctamente', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/3')
        .send({
          ...testUser,
          health: testUserHealth,
          activity: {
            ...testUserActivity,
            ...testUserExercise
          }
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Validación del paso 3 exitosa');
    });

    it('debería validar el paso 4 (nutrición) correctamente', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/4')
        .send({
          ...testUser,
          health: {
            ...testUserHealth,
            ...testUserNutrition
          },
          activity: {
            ...testUserActivity,
            ...testUserExercise
          }
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Validación del paso 4 exitosa');
    });
  });

  describe('Registration Validation Errors', () => {
    it('debería fallar en el paso 0 con email inválido', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/0')
        .send({
          ...testUser,
          email: "invalid-email"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((e: ValidationError) => e.path === 'email')).toBeTruthy();
    });

    it('debería fallar en el paso 0 con contraseña débil', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/0')
        .send({
          ...testUser,
          password: "weak"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((e: ValidationError) => e.path === 'password')).toBeTruthy();
    });

    it('debería fallar en el paso 1 con altura inválida', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/1')
        .send({
          ...testUser,
          health: {
            ...testUserHealth,
            altura: 50 // Muy baja
          }
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((e: ValidationError) => e.path === 'health.altura')).toBeTruthy();
    });

    it('debería fallar en el paso 2 con nivel de actividad inválido', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/2')
        .send({
          ...testUser,
          health: testUserHealth,
          activity: {
            ...testUserActivity,
            nivelActividad: "Inválido"
          }
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((e: ValidationError) => e.path === 'activity.nivelActividad')).toBeTruthy();
    });

    it('debería fallar en el paso 3 con tipo de ejercicio inválido', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/3')
        .send({
          ...testUser,
          health: testUserHealth,
          activity: {
            ...testUserActivity,
            ...testUserExercise,
            tipoEjercicio: ["Ejercicio Inválido"]
          }
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((e: ValidationError) => e.path === 'activity.tipoEjercicio')).toBeTruthy();
    });

    it('debería fallar en el paso 4 con horarios de comida inválidos', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/4')
        .send({
          ...testUser,
          health: {
            ...testUserHealth,
            ...testUserNutrition,
            comidasDia: 1, // Solo 1 comida
            horariosComidas: [
              { comida: "Desayuno", hora: "99:99" } // Hora obviamente inválida
            ]
          },
          activity: {
            ...testUserActivity,
            ...testUserExercise
          }
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
    });

    it('debería fallar en el paso 4 si el número de horarios no coincide con comidasDia', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/4')
        .send({
          ...testUser,
          health: {
            ...testUserHealth,
            ...testUserNutrition,
            comidasDia: 3,
            horariosComidas: [
              { comida: "Desayuno", hora: "08:00" },
              { comida: "Almuerzo", hora: "14:00" }
              // Solo 2 horarios para 3 comidas
            ]
          },
          activity: {
            ...testUserActivity,
            ...testUserExercise
          }
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((e: ValidationError) => e.path === 'health.horariosComidas')).toBeTruthy();
    });
  });

  describe('Complete User Registration', () => {
    it('debería registrar un usuario completo exitosamente', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          ...testUser,
          health: {
            ...testUserHealth,
            ...testUserNutrition
          },
          activity: {
            ...testUserActivity,
            ...testUserExercise
          }
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).toHaveProperty('role', 'user');
    });

    it('debería fallar al registrar un usuario con email duplicado', async () => {
      // Primera vez - crear usuario directamente en la base de datos
      await User.create({
        fullName: testUser.fullName,
        email: "duplicate@example.com",
        password: testUser.password,
        phoneNumber: testUser.phoneNumber,
        gender: testUser.gender,
        birthDate: new Date(testUser.birthDate),
        role: 'user'
      });

      // Segunda vez - debería fallar
      const res = await request(app)
        .post('/api/users/register')
        .send({
          ...testUser,
          email: "duplicate@example.com",
          health: testUserHealth,
          activity: testUserActivity
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.some((e: ValidationError) => e.msg === 'El email ya está registrado')).toBeTruthy();
    });
  });

  describe('User Login', () => {
    let loginToken: string;

    beforeEach(async () => {
      // Crear usuario directamente en la base de datos para cada test de login
      await User.create({
        fullName: testUser.fullName,
        email: "loginuser@example.com",
        password: testUser.password,
        phoneNumber: testUser.phoneNumber,
        gender: testUser.gender,
        birthDate: new Date(testUser.birthDate),
        role: 'user'
      });

      // Hacer login y obtener el token
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({ email: 'loginuser@example.com', password: 'Test1234' });
      loginToken = loginRes.body.token;
    });

    it('debería hacer login exitosamente con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: "loginuser@example.com",
          password: "Test1234"
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toEqual("loginuser@example.com");
      
      // Verificar que el token obtenido en beforeAll es válido
      expect(loginToken).toBeDefined();
      expect(typeof loginToken).toBe('string');
    });

    it('debería fallar el login con email incorrecto', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: "nonexistent@example.com",
          password: "Test1234"
        });

      expect(res.statusCode).toEqual(401);
    });

    it('debería fallar el login con contraseña incorrecta', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: "loginuser@example.com",
          password: "WrongPassword123"
        });

      expect(res.statusCode).toEqual(401);
    });

    it('debería fallar el login con email inválido', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: "invalid-email",
          password: "Test1234"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
    });

    it('debería fallar el login sin contraseña', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: "loginuser@example.com"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('Edge Cases and Special Scenarios', () => {
    it('debería manejar campos opcionales correctamente en el registro', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          ...testUser,
          email: "optional@example.com",
          health: {
            altura: testUserHealth.altura,
            pesoActual: testUserHealth.pesoActual,
            objetivoPeso: testUserHealth.objetivoPeso,
            condicionesMedicas: [],
            restriccionesDieteticas: [],
            alergiasIntolerancias: [],
            preferenciasAlimentarias: [],
            comidasDia: 3,
            horariosComidas: [
              { comida: "Desayuno", hora: "08:00" },
              { comida: "Almuerzo", hora: "14:00" },
              { comida: "Cena", hora: "20:00" }
            ]
          },
          activity: {
            nivelActividad: testUserActivity.nivelActividad,
            frecuenciaEjercicio: testUserActivity.frecuenciaEjercicio,
            tipoEjercicio: [],
            objetivo: "Salud general",
            otrosEjercicios: "",
            disponibilidad: "Lunes a Viernes"
          }
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.user).toHaveProperty('_id');
    });

    it('debería validar formato de hora correctamente', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/4')
        .send({
          ...testUser,
          health: {
            ...testUserHealth,
            ...testUserNutrition,
            comidasDia: 2,
            horariosComidas: [
              { comida: "Desayuno", hora: "08:30" },
              { comida: "Almuerzo", hora: "14:15" }
            ]
          },
          activity: {
            ...testUserActivity,
            ...testUserExercise
          }
        });

      expect(res.statusCode).toEqual(200);
    });

    it('debería validar tipos de comida válidos', async () => {
      const res = await request(app)
        .post('/api/users/validate-step/4')
        .send({
          ...testUser,
          health: {
            ...testUserHealth,
            ...testUserNutrition,
            horariosComidas: [
              { comida: "Desayuno", hora: "08:00" },
              { comida: "Media mañana", hora: "11:00" },
              { comida: "Almuerzo", hora: "14:00" },
              { comida: "Merienda", hora: "17:00" },
              { comida: "Cena", hora: "20:00" }
            ]
          },
          activity: {
            ...testUserActivity,
            ...testUserExercise
          }
        });

      expect(res.statusCode).toEqual(200);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
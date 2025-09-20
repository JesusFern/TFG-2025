import request from 'supertest';
import app from '../../src/server';
import mongoose from 'mongoose';
import User from '../../src/models/users/user';
import { TokenService } from '../../src/utils/tokenService';

describe('Video API - Token Generation', () => {
  let authToken: string;
  let testUser: InstanceType<typeof User>;

  beforeAll(async () => {
    // Crear usuario de prueba
    testUser = new User({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '+1234567890',
      role: 'user',
      gender: 'Masculino',
      birthDate: new Date('1990-01-01')
    });
    await testUser.save();

    // Generar token de autenticación
    authToken = TokenService.generateToken({
      id: (testUser._id as mongoose.Types.ObjectId).toString(),
      email: testUser.email,
      role: testUser.role
    });
  });

  afterAll(async () => {
    // Limpiar base de datos
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/video/token', () => {
    it('should generate a Stream.io token for authenticated user', async () => {
      const response = await request(app)
        .post('/api/video/token')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body.message).toBe('Token generado exitosamente');
      
      // Verificar que el token es un JWT válido
      expect(response.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      
      // Verificar que el userId coincide
      expect(response.body.userId).toBe((testUser._id as mongoose.Types.ObjectId).toString());
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app)
        .post('/api/video/token')
        .expect(401);
    });

    it('should return 400 for invalid token', async () => {
      await request(app)
        .post('/api/video/token')
        .set('Authorization', 'Bearer invalid-token')
        .expect(400);
    });
  });
});

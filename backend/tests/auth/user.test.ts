import request from 'supertest';
import app from '../../src/server';
import mongoose from 'mongoose';

describe('User Endpoints', () => {
  it('debería crear un usuario', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        fullName: 'Test User',
        email: 'testuser@example.com',
        password: 'Test1234',
        gender: 'Masculino',
        birthDate: '1990-01-01',
        phoneNumber: '+34123456789',
        role: 'user'
      });
      console.log(res.body); 
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
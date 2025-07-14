import request from 'supertest';
import app from '../../src/server';
import mongoose from 'mongoose';
import User from '../../src/models/users/user';



describe('Worker registration endpoint', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await User.deleteMany({});

    await User.create({
      fullName: 'Administrador Principal',
      email: 'admin@example.com',
      password: 'Admin1234',
      phoneNumber: '123456789',
      role: 'admin'
    });

    await User.create({
      fullName: 'User1',
      email: 'user1@example.com',
      password: 'User1',
      phoneNumber: '111111111',
      role: 'user',
      gender: 'Masculino',
      birthDate: new Date('2000-01-01')
    });

    const adminRes = await request(app)
      .post('/api/users/login')
      .send({ email: 'admin@example.com', password: 'Admin1234' });
    adminToken = adminRes.body.token;

    const userRes = await request(app)
      .post('/api/users/login')
      .send({ email: 'user1@example.com', password: 'User1' });
    userToken = userRes.body.token;
  });

  it('NO permite crear trabajador sin estar logeado', async () => {
    const res = await request(app)
      .post('/api/workers/register')
      .send({
        fullName: "Trabajador Test",
        email: "worker_test1@example.com",
        password: "Worker123",
        phoneNumber: "333333333",
        birthDate: "1995-05-05",
        profilePicture: "https://example.com/profile.jpg",
        workerType: "Nutricionista",
        biography: "Bio test",
        availability: "Lunes a viernes"
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Acceso denegado/i);
  });

  it('NO permite crear trabajador con usuario cliente logeado', async () => {
    const res = await request(app)
      .post('/api/workers/register')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fullName: "Trabajador Test",
        email: "worker_test2@example.com",
        password: "Worker123",
        phoneNumber: "333333333",
        birthDate: "1995-05-05",
        profilePicture: "https://example.com/profile.jpg",
        workerType: "Nutricionista",
        biography: "Bio test",
        availability: "Lunes a viernes"
      });
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/permiso/i);
  });

  it('Permite crear trabajador con usuario admin logeado', async () => {
    const res = await request(app)
      .post('/api/workers/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: "Trabajador Test",
        email: "worker_test3@example.com",
        password: "Worker123",
        phoneNumber: "333333333",
        birthDate: "1995-05-05",
        profilePicture: "https://example.com/profile.jpg",
        workerType: "Nutricionista",
        biography: "Bio test",
        availability: "Lunes a viernes"
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.worker).toBeDefined();
    expect(res.body.worker.email).toBe("worker_test3@example.com");
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
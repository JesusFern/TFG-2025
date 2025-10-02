import request from 'supertest';
import app from '../../src/server';

describe('Incident Endpoints - Basic Tests', () => {
  // Tests muy básicos que solo verifican autenticación y validación

  describe('POST /api/incidents', () => {
    it('should require authentication', async () => {
      const incidentData = {
        descripcion: "Problema sin autenticación"
      };

      const response = await request(app)
        .post('/api/incidents')
        .send(incidentData);

      expect(response.status).toBe(401);
    });

    it('should require description', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .set('Authorization', 'Bearer invalid-token')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/incidents/mis-incidencias', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/incidents/mis-incidencias');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/incidents/admin', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/incidents/admin');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/incidents/:id/asignar', () => {
    it('should require authentication', async () => {
      const incidentId = 'test-incident-id';
      const response = await request(app)
        .put(`/api/incidents/${incidentId}/asignar`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/incidents/:id/marcar-resuelta', () => {
    it('should require authentication', async () => {
      const incidentId = 'test-incident-id';
      const response = await request(app)
        .put(`/api/incidents/${incidentId}/marcar-resuelta`)
        .send({ estado: 'Resuelta' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/incidents/:id', () => {
    it('should require authentication', async () => {
      const incidentId = 'test-incident-id';
      const response = await request(app)
        .delete(`/api/incidents/${incidentId}`);

      expect(response.status).toBe(401);
    });
  });
});

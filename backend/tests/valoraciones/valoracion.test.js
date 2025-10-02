"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Variables globales para los IDs reales
let realClienteId;
let realTrabajadorId;
let currentUserId;
// Mock de autenticación ANTES de cualquier importación
jest.mock('../../src/middlewares/authMiddleware', () => {
    return {
        authenticateToken: (req, _res, next) => {
            req.user = { id: currentUserId || realClienteId, role: 'user', email: 'user@example.com' };
            next();
        },
        authorizeWorker: (_req, _res, next) => next(),
        authorizeAdmin: (_req, _res, next) => next(),
        authorizeUserOrAdmin: (_req, _res, next) => next(),
        authorizeNutricionista: (_req, _res, next) => next()
    };
});
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = __importDefault(require("../../src/server"));
const user_1 = __importDefault(require("../../src/models/users/user"));
const valoracion_1 = __importDefault(require("../../src/models/valoraciones/valoracion"));
const passwordService_1 = require("../../src/utils/passwordService");
describe('Valoraciones API', () => {
    let clienteToken;
    let cliente;
    let trabajador;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Limpiar la base de datos antes de cada test
        yield valoracion_1.default.deleteMany({});
        yield user_1.default.deleteMany({});
        // Crear cliente de prueba
        cliente = new user_1.default({
            fullName: 'Cliente Test',
            email: 'cliente@test.com',
            password: yield passwordService_1.PasswordService.hashPassword('Password123'),
            phoneNumber: '+1234567890',
            role: 'user',
            gender: 'Masculino',
            birthDate: new Date('1990-01-01')
        });
        yield cliente.save();
        // Asignar el ID real del cliente a la variable global
        realClienteId = cliente._id.toString();
        // Crear trabajador de prueba SIN clientes asignados inicialmente
        trabajador = new user_1.default({
            fullName: 'Trabajador Test',
            email: 'trabajador@test.com',
            password: yield passwordService_1.PasswordService.hashPassword('Password123'),
            phoneNumber: '+1234567891',
            role: 'worker',
            gender: 'Femenino',
            birthDate: new Date('1985-01-01'),
            workerType: 'Nutricionista',
            biography: 'Nutricionista y entrenador personal con amplia experiencia',
            availability: 'Lunes a Viernes de 9:00 a 18:00',
            clientesAsignados: []
        });
        yield trabajador.save();
        // Ahora agregar las asignaciones de clientes después de que ambos usuarios existan
        trabajador.clientesAsignados = [
            {
                clienteId: cliente._id,
                tipoAsignacion: 'Nutricionista'
            },
            {
                clienteId: cliente._id,
                tipoAsignacion: 'Entrenador personal'
            }
        ];
        yield trabajador.save();
        // Asignar el ID real del trabajador a la variable global
        realTrabajadorId = trabajador._id.toString();
        // Obtener tokens de autenticación (simulados)
        clienteToken = 'mock_cliente_token';
        // Usuario autenticado por defecto: el cliente real
        currentUserId = realClienteId;
    }));
    // Helper para crear una valoración y devolver su ID
    const crearValoracion = (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const payload = {
            trabajadorId: realTrabajadorId,
            calificacion: (_a = data === null || data === void 0 ? void 0 : data.calificacion) !== null && _a !== void 0 ? _a : 5,
            descripcion: (_b = data === null || data === void 0 ? void 0 : data.descripcion) !== null && _b !== void 0 ? _b : 'Excelente profesional con gran dedicación',
            tipoTrabajador: (_c = data === null || data === void 0 ? void 0 : data.tipoTrabajador) !== null && _c !== void 0 ? _c : 'Nutricionista'
        };
        const resp = yield (0, supertest_1.default)(server_1.default)
            .post('/api/valoraciones')
            .set('Authorization', `Bearer ${clienteToken}`)
            .send(payload)
            .expect(201);
        return resp.body.data._id;
    });
    describe('POST /api/valoraciones', () => {
        it('debería crear una valoración exitosamente', () => __awaiter(void 0, void 0, void 0, function* () {
            const valoracionData = {
                trabajadorId: realTrabajadorId,
                calificacion: 5,
                descripcion: 'Excelente nutricionista, muy profesional y atenta',
                tipoTrabajador: 'Nutricionista'
            };
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/api/valoraciones')
                .set('Authorization', `Bearer ${clienteToken}`)
                .send(valoracionData);
            // Mostrar el error real para debugging
            if (response.status !== 201) {
                console.log('Error en creación de valoración:', response.status, response.body);
            }
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Valoración creada exitosamente');
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data.calificacion).toBe(5);
            expect(response.body.data.descripcion).toBe(valoracionData.descripcion);
            expect(response.body.data.tipoTrabajador).toBe('Nutricionista');
        }));
        it('debería fallar si el cliente no está asignado al trabajador', () => __awaiter(void 0, void 0, void 0, function* () {
            const otroTrabajador = new user_1.default({
                fullName: 'Otro Trabajador',
                email: 'otro@test.com',
                password: yield passwordService_1.PasswordService.hashPassword('Password123'),
                phoneNumber: '+1234567892',
                role: 'worker',
                gender: 'Masculino',
                birthDate: new Date('1980-01-01'),
                workerType: 'Entrenador personal',
                biography: 'Entrenador personal especializado',
                availability: 'Lunes a Viernes de 8:00 a 20:00'
            });
            yield otroTrabajador.save();
            const valoracionData = {
                trabajadorId: otroTrabajador._id.toString(),
                calificacion: 4,
                descripcion: 'Buen entrenador',
                tipoTrabajador: 'Entrenador personal'
            };
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/api/valoraciones')
                .set('Authorization', `Bearer ${clienteToken}`)
                .send(valoracionData)
                .expect(403);
            expect(response.body.message).toBe('No tienes permisos para valorar a este trabajador');
        }));
        it('debería permitir crear valoración para Entrenador personal después de Nutricionista', () => __awaiter(void 0, void 0, void 0, function* () {
            const valoracionData = {
                trabajadorId: realTrabajadorId,
                calificacion: 4,
                descripcion: 'Excelente entrenador personal, muy motivador',
                tipoTrabajador: 'Entrenador personal'
            };
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/api/valoraciones')
                .set('Authorization', `Bearer ${clienteToken}`)
                .send(valoracionData)
                .expect(201);
            expect(response.body.message).toBe('Valoración creada exitosamente');
            expect(response.body.data.tipoTrabajador).toBe('Entrenador personal');
        }));
        it('debería fallar si ya existe una valoración activa para el mismo tipo', () => __awaiter(void 0, void 0, void 0, function* () {
            // Crear primera valoración de Nutricionista
            yield crearValoracion({ tipoTrabajador: 'Nutricionista', calificacion: 5 });
            // Intentar crear otra del mismo tipo
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/api/valoraciones')
                .set('Authorization', `Bearer ${clienteToken}`)
                .send({
                trabajadorId: realTrabajadorId,
                calificacion: 3,
                descripcion: 'Otra valoración de nutricionista',
                tipoTrabajador: 'Nutricionista'
            })
                .expect(400);
            expect(response.body.message).toContain('Ya existe una valoración activa para este trabajador como Nutricionista');
        }));
        it('debería fallar con datos inválidos', () => __awaiter(void 0, void 0, void 0, function* () {
            const valoracionData = {
                trabajadorId: 'invalid_id',
                calificacion: 6, // Calificación inválida
                descripcion: 'Corta', // Descripción muy corta
                tipoTrabajador: 'InvalidType'
            };
            const response = yield (0, supertest_1.default)(server_1.default)
                .post('/api/valoraciones')
                .set('Authorization', `Bearer ${clienteToken}`)
                .send(valoracionData)
                .expect(400);
            // Debe contener mensajes de validación
            expect(typeof response.body.message).toBe('string');
            expect(response.body.message).toContain('El ID del trabajador no es válido');
        }));
    });
    describe('GET /api/valoraciones', () => {
        it('debería obtener todas las valoraciones', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get('/api/valoraciones')
                .expect(200);
            expect(response.body.message).toBe('Valoraciones obtenidas exitosamente');
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.pagination).toHaveProperty('page');
            expect(response.body.pagination).toHaveProperty('total');
        }));
        it('debería filtrar valoraciones por trabajador', () => __awaiter(void 0, void 0, void 0, function* () {
            // Crear una valoración previamente
            yield crearValoracion({ tipoTrabajador: 'Nutricionista', calificacion: 5 });
            const response = yield (0, supertest_1.default)(server_1.default)
                .get(`/api/valoraciones?trabajadorId=${realTrabajadorId}`)
                .expect(200);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].trabajador._id).toBe(realTrabajadorId);
        }));
        it('debería filtrar valoraciones por calificación', () => __awaiter(void 0, void 0, void 0, function* () {
            // Crear dos valoraciones con diferentes calificaciones
            yield crearValoracion({ calificacion: 5 });
            const response = yield (0, supertest_1.default)(server_1.default)
                .get('/api/valoraciones?calificacionMin=4&calificacionMax=5')
                .expect(200);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].calificacion).toBeGreaterThanOrEqual(4);
        }));
    });
    describe('GET /api/valoraciones/:id', () => {
        it('debería obtener una valoración específica', () => __awaiter(void 0, void 0, void 0, function* () {
            // Crear valoración y capturar su ID
            const id = yield crearValoracion();
            const response = yield (0, supertest_1.default)(server_1.default)
                .get(`/api/valoraciones/${id}`)
                .expect(200);
            expect(response.body.message).toBe('Valoración obtenida exitosamente');
            expect(response.body.data._id).toBe(id);
        }));
        it('debería fallar con ID inválido', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get('/api/valoraciones/invalid_id')
                .expect(400);
            expect(response.body.message).toBe('El ID de la valoración no es válido');
        }));
    });
    describe('PUT /api/valoraciones/:id', () => {
        it('debería actualizar una valoración exitosamente', () => __awaiter(void 0, void 0, void 0, function* () {
            // Crear valoración
            const id = yield crearValoracion();
            const updateData = {
                calificacion: 4,
                descripcion: 'Valoración actualizada con nueva descripción'
            };
            const response = yield (0, supertest_1.default)(server_1.default)
                .put(`/api/valoraciones/${id}`)
                .set('Authorization', `Bearer ${clienteToken}`)
                .send(updateData)
                .expect(200);
            expect(response.body.message).toBe('Valoración actualizada exitosamente');
            expect(response.body.data.calificacion).toBe(4);
            expect(response.body.data.descripcion).toBe(updateData.descripcion);
        }));
        it('debería fallar si el usuario no es el autor de la valoración', () => __awaiter(void 0, void 0, void 0, function* () {
            // Crear valoración como cliente actual
            const id = yield crearValoracion();
            const otroCliente = new user_1.default({
                fullName: 'Otro Cliente',
                email: 'otrocliente@test.com',
                password: yield passwordService_1.PasswordService.hashPassword('Password123'),
                phoneNumber: '+1234567893',
                role: 'user',
                gender: 'Femenino',
                birthDate: new Date('1995-01-01')
            });
            yield otroCliente.save();
            const updateData = {
                calificacion: 3,
                descripcion: 'Intento de actualización no autorizada'
            };
            // Simular autenticación como otro cliente
            const prevUser = currentUserId;
            currentUserId = otroCliente._id.toString();
            const response = yield (0, supertest_1.default)(server_1.default)
                .put(`/api/valoraciones/${id}`)
                .set('Authorization', `Bearer mock_otro_cliente_token`)
                .send(updateData)
                .expect(403);
            currentUserId = prevUser;
            expect(response.body.message).toBe('No tienes permisos para actualizar esta valoración');
        }));
    });
    describe('DELETE /api/valoraciones/:id', () => {
        it('debería eliminar una valoración exitosamente', () => __awaiter(void 0, void 0, void 0, function* () {
            const id = yield crearValoracion();
            const response = yield (0, supertest_1.default)(server_1.default)
                .delete(`/api/valoraciones/${id}`)
                .set('Authorization', `Bearer ${clienteToken}`)
                .expect(200);
            expect(response.body.message).toBe('Valoración eliminada exitosamente');
            expect(response.body.data.activa).toBe(false);
        }));
        it('debería fallar si el usuario no es el autor de la valoración', () => __awaiter(void 0, void 0, void 0, function* () {
            // Crear otra valoración
            const id = yield crearValoracion();
            // Simular autenticación como otro cliente
            const otroClienteId = new mongoose_1.default.Types.ObjectId().toString();
            const prevUser = currentUserId;
            currentUserId = otroClienteId;
            const response = yield (0, supertest_1.default)(server_1.default)
                .delete(`/api/valoraciones/${id}`)
                .set('Authorization', `Bearer ${clienteToken}`)
                .expect(403);
            currentUserId = prevUser;
            expect(response.body.message).toBe('No tienes permisos para eliminar esta valoración');
        }));
    });
    describe('GET /api/valoraciones/stats', () => {
        it('debería obtener estadísticas de valoraciones', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get('/api/valoraciones/stats')
                .expect(200);
            expect(response.body.message).toBe('Estadísticas obtenidas exitosamente');
            expect(response.body.data).toHaveProperty('totalValoraciones');
            expect(response.body.data).toHaveProperty('calificacionPromedio');
            expect(response.body.data).toHaveProperty('distribucionCalificaciones');
            expect(response.body.data).toHaveProperty('valoracionesPorTipo');
        }));
        it('debería filtrar estadísticas por trabajador', () => __awaiter(void 0, void 0, void 0, function* () {
            yield crearValoracion({ tipoTrabajador: 'Nutricionista', calificacion: 5 });
            const response = yield (0, supertest_1.default)(server_1.default)
                .get(`/api/valoraciones/stats?trabajadorId=${realTrabajadorId}`)
                .expect(200);
            expect(response.body.data.totalValoraciones).toBeGreaterThan(0);
        }));
    });
    describe('GET /api/valoraciones/trabajador/:trabajadorId', () => {
        it('debería obtener valoraciones de un trabajador específico', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get(`/api/valoraciones/trabajador/${realTrabajadorId}`)
                .expect(200);
            expect(response.body.message).toBe('Valoraciones del trabajador obtenidas exitosamente');
            expect(response.body.data).toBeInstanceOf(Array);
        }));
    });
    describe('GET /api/valoraciones/cliente/:clienteId', () => {
        it('debería obtener valoraciones de un cliente específico', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get(`/api/valoraciones/cliente/${realClienteId}`)
                .set('Authorization', `Bearer ${clienteToken}`)
                .expect(200);
            expect(response.body.message).toBe('Valoraciones del cliente obtenidas exitosamente');
            expect(response.body.data).toBeInstanceOf(Array);
        }));
        it('debería fallar si el usuario intenta ver valoraciones de otro cliente', () => __awaiter(void 0, void 0, void 0, function* () {
            const otroClienteId = new mongoose_1.default.Types.ObjectId().toString();
            const response = yield (0, supertest_1.default)(server_1.default)
                .get(`/api/valoraciones/cliente/${otroClienteId}`)
                .set('Authorization', `Bearer ${clienteToken}`)
                .expect(403);
            expect(response.body.message).toBe('No tienes permisos para ver las valoraciones de otro cliente');
        }));
    });
    describe('GET /api/valoraciones/can-valorar/verify', () => {
        it('debería verificar si un cliente puede valorar a un trabajador', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get('/api/valoraciones/can-valorar/verify')
                .set('Authorization', `Bearer ${clienteToken}`)
                .query({
                trabajadorId: realTrabajadorId,
                tipoTrabajador: 'Nutricionista'
            })
                .expect(200);
            expect(response.body.message).toBe('Verificación completada');
            expect(response.body.data.puedeValorar).toBe(true);
        }));
        it('debería retornar false si el cliente no puede valorar al trabajador', () => __awaiter(void 0, void 0, void 0, function* () {
            const otroTrabajador = new mongoose_1.default.Types.ObjectId().toString();
            const response = yield (0, supertest_1.default)(server_1.default)
                .get('/api/valoraciones/can-valorar/verify')
                .set('Authorization', `Bearer ${clienteToken}`)
                .query({
                trabajadorId: otroTrabajador,
                tipoTrabajador: 'Entrenador personal'
            })
                .expect(200);
            expect(response.body.data.puedeValorar).toBe(false);
        }));
    });
    describe('GET /api/valoraciones/trabajador/:trabajadorId/tipos-disponibles', () => {
        it('debería obtener tipos de trabajador disponibles para valorar', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get(`/api/valoraciones/trabajador/${realTrabajadorId}/tipos-disponibles`)
                .set('Authorization', `Bearer ${clienteToken}`)
                .expect(200);
            expect(response.body.message).toBe('Tipos de trabajador disponibles obtenidos exitosamente');
            expect(response.body.data.tiposDisponibles).toBeInstanceOf(Array);
            expect(response.body.data.tiposDisponibles).toHaveLength(2);
            const tipos = response.body.data.tiposDisponibles.map((t) => t.tipo);
            expect(tipos).toContain('Nutricionista');
            expect(tipos).toContain('Entrenador personal');
        }));
        it('debería mostrar si ya se valoró cada tipo', () => __awaiter(void 0, void 0, void 0, function* () {
            // Crear una valoración previa para marcar un tipo como ya valorado
            yield crearValoracion({ tipoTrabajador: 'Nutricionista', calificacion: 5 });
            const response = yield (0, supertest_1.default)(server_1.default)
                .get(`/api/valoraciones/trabajador/${realTrabajadorId}/tipos-disponibles`)
                .set('Authorization', `Bearer ${clienteToken}`)
                .expect(200);
            const tipos = response.body.data.tiposDisponibles;
            // Debería haber al menos un tipo ya valorado (el que creamos en el test anterior)
            const yaValorados = tipos.filter((t) => t.yaValorado);
            expect(yaValorados.length).toBeGreaterThan(0);
        }));
    });
    describe('GET /api/valoraciones/trabajador/:trabajadorId/stats-by-tipo', () => {
        it('debería obtener estadísticas detalladas por tipo de trabajador', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(server_1.default)
                .get(`/api/valoraciones/trabajador/${realTrabajadorId}/stats-by-tipo`)
                .expect(200);
            expect(response.body.message).toBe('Estadísticas por tipo obtenidas exitosamente');
            expect(response.body.data).toHaveProperty('nutricionista');
            expect(response.body.data).toHaveProperty('entrenador');
            expect(response.body.data).toHaveProperty('general');
            // Verificar estructura de cada tipo
            ['nutricionista', 'entrenador', 'general'].forEach(tipo => {
                expect(response.body.data[tipo]).toHaveProperty('totalValoraciones');
                expect(response.body.data[tipo]).toHaveProperty('calificacionPromedio');
                expect(response.body.data[tipo]).toHaveProperty('distribucionCalificaciones');
                expect(response.body.data[tipo]).toHaveProperty('valoracionesPorTipo');
            });
        }));
    });
});

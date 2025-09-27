import { Router } from 'express';
import { param } from 'express-validator';
import { buscarEjerciciosWger, obtenerDetallesEjercicioWger } from '../../controllers/training/wgerController';
import { validateRequest } from '../../middlewares/validationMiddleware';

const router = Router();

// GET /api/wger/ejercicios - Buscar ejercicios en wger
router.get('/ejercicios', buscarEjerciciosWger);

// GET /api/wger/ejercicios/:id - Obtener detalles de un ejercicio de wger
router.get('/ejercicios/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de ejercicio no válido')
], validateRequest, obtenerDetallesEjercicioWger);

export default router;

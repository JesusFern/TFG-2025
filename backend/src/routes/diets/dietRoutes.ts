import { Router } from 'express';
import { crearDieta, obtenerDieta, actualizarPlatos, actualizarDieta, actualizarDiaDieta, publicarDieta, obtenerDietasPorWorkerYCliente } from '../../controllers/diets/dietController';
import { authenticateToken, authorizeNutricionista } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticateToken, authorizeNutricionista, crearDieta);
router.get('/:id', authenticateToken, obtenerDieta);
router.patch('/:id', authenticateToken, authorizeNutricionista, actualizarDieta);
router.patch('/:dietaId/dias/:diaIndex', authenticateToken, authorizeNutricionista, actualizarDiaDieta);
router.patch('/:id/publicar', authenticateToken, authorizeNutricionista, publicarDieta);

router.put('/platos', authenticateToken, authorizeNutricionista, actualizarPlatos);
router.post('/platos', authenticateToken, authorizeNutricionista, actualizarPlatos);

router.get('/worker/:workerId/client/:clientId', authenticateToken, authorizeNutricionista, obtenerDietasPorWorkerYCliente);
export default router;
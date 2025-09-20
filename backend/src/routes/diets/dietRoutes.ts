import { Router } from 'express';
import { crearDieta, obtenerDieta, actualizarPlatos, actualizarDieta, actualizarDiaDieta, publicarDieta, obtenerDietasPorWorkerYCliente, crearPlato, eliminarPlato, getMyDiets } from '../../controllers/diets/dietController';
import { authenticateToken, authorizeNutricionista } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticateToken, authorizeNutricionista, crearDieta);

// Rutas específicas deben ir ANTES de las rutas con parámetros dinámicos
router.get('/my-diets', authenticateToken, getMyDiets);
router.get('/worker/:workerId/client/:clientId', authenticateToken, authorizeNutricionista, obtenerDietasPorWorkerYCliente);

// Rutas con parámetros dinámicos van al final
router.get('/:id', authenticateToken, obtenerDieta);
router.patch('/:id', authenticateToken, authorizeNutricionista, actualizarDieta);
router.patch('/:dietaId/dias/:diaIndex', authenticateToken, authorizeNutricionista, actualizarDiaDieta);
router.patch('/:id/publicar', authenticateToken, authorizeNutricionista, publicarDieta);

router.put('/platos', authenticateToken, authorizeNutricionista, actualizarPlatos);
router.post('/platos', authenticateToken, authorizeNutricionista, crearPlato);
router.delete('/platos/:platoId', authenticateToken, authorizeNutricionista, eliminarPlato);
export default router;
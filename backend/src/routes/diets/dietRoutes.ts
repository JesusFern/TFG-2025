import { Router } from 'express';
import { crearDieta, obtenerDieta, actualizarPlatos, actualizarDieta, actualizarDiaDieta, publicarDieta, obtenerDietasPorWorkerYCliente, crearPlato, eliminarPlato, getMyDiets, getMyCreatedDiets, eliminarDieta } from '../../controllers/diets/dietController';
import { authenticateToken, authorizeNutricionista } from '../../middlewares/authMiddleware';
import { crearDietaValidator, actualizarDietaValidator } from '../../validators/diets/dietValidators';
import { validateRequest } from '../../middlewares/validationMiddleware';
import dietTemplateRoutes from './dietTemplateRoutes';
import dietCopyRoutes from './dietCopyRoutes';

const router = Router();

// Rutas de plantillas de dietas
router.use('/templates', dietTemplateRoutes);

// Rutas de copia de dietas
router.use('/copy', dietCopyRoutes);

router.post('/', authenticateToken, authorizeNutricionista, crearDietaValidator, validateRequest, crearDieta);


// Rutas específicas deben ir ANTES de las rutas con parámetros dinámicos
router.get('/my-diets', authenticateToken, getMyDiets);
router.get('/my-created-diets', authenticateToken, authorizeNutricionista, getMyCreatedDiets);
router.get('/worker/:workerId/client/:clientId', authenticateToken, authorizeNutricionista, obtenerDietasPorWorkerYCliente);

router.get('/:id', authenticateToken, obtenerDieta);
router.patch('/:id', authenticateToken, authorizeNutricionista, actualizarDietaValidator, validateRequest, actualizarDieta);
router.patch('/:dietaId/dias/:diaIndex', authenticateToken, authorizeNutricionista, actualizarDiaDieta);
router.patch('/:id/publicar', authenticateToken, authorizeNutricionista, publicarDieta);
router.delete('/:id', authenticateToken, authorizeNutricionista, eliminarDieta);

router.put('/platos', authenticateToken, authorizeNutricionista, actualizarPlatos);
router.post('/platos', authenticateToken, authorizeNutricionista, crearPlato);
router.delete('/platos/:platoId', authenticateToken, authorizeNutricionista, eliminarPlato);

export default router;
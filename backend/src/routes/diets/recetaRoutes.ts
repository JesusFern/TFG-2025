import { Router } from 'express';
import { 
  crearReceta, 
  obtenerReceta, 
  obtenerRecetas,
  obtenerRecetasPublicas,
  obtenerMisRecetas,
  obtenerRecetasPublicasYPropias
} from '../../controllers/diets/recetaController';
import { authenticateToken, authorizeNutricionista } from '../../middlewares/authMiddleware';
import { handleUploadError } from '../../middlewares/uploadMiddleware';
import upload from '../../config/multer';

const router = Router();

router.post('/', authenticateToken, authorizeNutricionista, upload.array('imagenes', 5), crearReceta);
router.get('/mis-recetas', authenticateToken, obtenerMisRecetas);
router.get('/publicas', authenticateToken, obtenerRecetasPublicas);
router.get('/publicas-y-propias', authenticateToken, obtenerRecetasPublicasYPropias);
router.get('/', authenticateToken, obtenerRecetas);
router.get('/:id', authenticateToken, obtenerReceta);

router.use(handleUploadError);

export default router;

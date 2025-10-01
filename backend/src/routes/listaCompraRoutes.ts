import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import { verificarPermisosListaCompra } from '../validators/listaCompraValidators';
import { generarListaCompraSemana } from '../controllers/diets/listaCompraController';

const router = Router();


router.get('/:dietaId/semana/:semana', authenticateToken, verificarPermisosListaCompra, generarListaCompraSemana);

export default router;

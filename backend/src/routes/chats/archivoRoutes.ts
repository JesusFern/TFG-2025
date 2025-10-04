import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware';
import { subirArchivoChat, subirArchivosChat } from '../../controllers/chats/archivoController';
import multerChat from '../../config/multerChat';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas para subir archivos de chat
router.post('/single', multerChat.single('archivo'), subirArchivoChat);
router.post('/multiple', multerChat.array('archivos', 5), subirArchivosChat);

export default router;

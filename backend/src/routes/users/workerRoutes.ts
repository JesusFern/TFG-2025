import { Router } from 'express';
import { registerWorker } from '../../controllers/users/workerController';

const router = Router();

router.post('/register', registerWorker);

export default router;
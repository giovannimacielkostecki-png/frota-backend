import { Router } from 'express';

import ctrl from '../controllers/authController.js';

import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.post('/login', ctrl.login);

router.post('/cadastrar', ctrl.cadastrar);

router.get('/perfil', autenticar, ctrl.perfil);

export default router;
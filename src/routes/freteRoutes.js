import { Router } from 'express';

import ctrl from '../controllers/freteController.js';

import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.use(autenticar);

router.post('/calcular', ctrl.calcular);

router.get('/', ctrl.listar);

router.post('/', ctrl.salvar);

router.patch('/:id/status', ctrl.atualizarStatus);

export default router;
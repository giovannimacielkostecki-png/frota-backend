import { Router } from 'express';

import ctrl from '../controllers/multaController.js';

import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.use(autenticar);

router.get('/', ctrl.listar);

router.get('/consultar/:placa', ctrl.consultarPorPlaca);

router.post('/', ctrl.criar);

router.patch('/:id/pagamento', ctrl.registrarPagamento);

export default router;
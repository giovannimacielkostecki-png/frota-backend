import { Router } from 'express';

import ctrl from '../controllers/abastecimentoController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.use(autenticar);

router.get('/', ctrl.listar);
router.get('/resumo', ctrl.resumoPorVeiculo);
router.post('/', ctrl.criar);
router.put('/:id',    auth, abastecimentoController.atualizar);
router.delete('/:id', auth, abastecimentoController.deletar);

export default router;

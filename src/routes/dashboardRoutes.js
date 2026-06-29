import { Router } from 'express';
import ctrl from '../controllers/dashboardController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.use(autenticar);

router.get('/resumo', ctrl.resumo);
router.get('/custos-mensais', ctrl.custosMensais);
router.get('/custo-veiculo', ctrl.custoPorVeiculo);
router.get('/km-por-veiculo', ctrl.kmPorVeiculo);

export default router;

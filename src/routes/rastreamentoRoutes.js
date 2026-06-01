import { Router } from 'express';

import ctrl from '../controllers/rastreamentoController.js';

import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.use(autenticar);

router.get('/atual', ctrl.posicaoAtual);

router.get('/veiculo/:veiculoId', ctrl.historicoPorVeiculo);

router.post('/ping', ctrl.registrarPosicao);

router.post('/sincronizar', ctrl.sincronizarGPS);

export default router;
// src/routes/pneuRoutes.js
import { Router } from 'express';

import ctrl from '../controllers/pneuController.js';

import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.use(autenticar);

router.get('/alertas', ctrl.alertasRodizio);

router.get('/veiculo/:veiculoId', ctrl.listarPorVeiculo);

router.post('/rodizio', ctrl.registrarRodizio);

export default router;
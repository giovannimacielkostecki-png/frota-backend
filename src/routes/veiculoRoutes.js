// src/routes/veiculoRoutes.js
import { Router } from 'express';
import ctrl from '../controllers/veiculoController.js';
import {
  autenticar,
  autorizar,
} from '../middlewares/auth.js';

const router = Router();

router.use(autenticar);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);

router.post(
  '/',
  autorizar('ADMIN', 'GESTOR'),
  ctrl.criar
);

router.put(
  '/:id',
  autorizar('ADMIN', 'GESTOR'),
  ctrl.atualizar
);

router.delete(
  '/:id',
  autorizar('ADMIN'),
  ctrl.desativar
);

export default router;

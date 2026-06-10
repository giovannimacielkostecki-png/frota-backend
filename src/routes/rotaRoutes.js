// src/routes/rotaRoutes.js
import { Router } from 'express';
import ctrl from '../controllers/rotaController.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();
router.use(autenticar);

router.get('/',      ctrl.listar);
router.post('/',     ctrl.criar);
router.delete('/:id', ctrl.deletar);

export default router;

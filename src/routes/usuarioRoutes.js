import { Router } from 'express';
import prisma from '../config/database.js';
import { autenticar, autorizar } from '../middlewares/auth.js';

const router = Router();

router.use(autenticar);
router.use(autorizar('ADMIN'));

// Listar todos
router.get('/', async (req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, perfil: true, ativo: true, criadoEm: true },
      orderBy: { criadoEm: 'desc' },
    });
    res.json(usuarios);
  } catch (err) { next(err); }
});

// Desativar
router.patch('/:id/desativar', async (req, res, next) => {
  try {
    await prisma.usuario.update({
      where: { id: req.params.id },
      data: { ativo: false },
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;

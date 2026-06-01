import { Router } from 'express';

import prisma from '../config/database.js';

import { autenticar } from '../middlewares/auth.js';

const router = Router();
router.use(autenticar);

router.get('/', async (req, res, next) => {
  try {
    const { veiculoId, tipo, dias = 30 } = req.query;
    const limite = new Date(Date.now() + Number(dias) * 86400000);
    const docs = await prisma.documento.findMany({
      where: {
        veiculoId: veiculoId || undefined,
        tipo:      tipo      || undefined,
        dataVencimento: { lte: limite },
      },
      include: { veiculo: { select: { placa: true, modelo: true } } },
      orderBy: { dataVencimento: 'asc' },
    });
    res.json(docs);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const doc = await prisma.documento.create({ data: req.body });
    res.status(201).json(doc);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const doc = await prisma.documento.update({ where: { id: req.params.id }, data: req.body });
    res.json(doc);
  } catch (err) { next(err); }
});

export default router;

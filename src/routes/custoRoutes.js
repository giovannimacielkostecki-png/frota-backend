// src/routes/custoRoutes.js
import { Router } from 'express';

import prisma from '../config/database.js';

import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.use(autenticar);

router.get('/', async (req, res, next) => {
  try {
    const {
      veiculoId,
      tipo,
      de,
      ate,
      page = 1,
      limit = 30,
    } = req.query;

    const custos = await prisma.custo.findMany({
      where: {
        veiculoId: veiculoId || undefined,

        tipo: tipo || undefined,

        data: {
          gte: de ? new Date(de) : undefined,

          lte: ate ? new Date(ate) : undefined,
        },
      },

      include: {
        veiculo: {
          select: {
            placa: true,
            modelo: true,
          },
        },
      },

      orderBy: {
        data: 'desc',
      },

      skip:
        (Number(page) - 1) *
        Number(limit),

      take: Number(limit),
    });

    res.json(custos);

  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {

    const custo = await prisma.custo.create({
      data: req.body,
    });

    res.status(201).json(custo);

  } catch (err) {
    next(err);
  }
});

export default router;

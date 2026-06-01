import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  const veiculos = await prisma.veiculo.findMany({
    orderBy: {
      id: 'desc',
    },
  });

  res.json(veiculos);
});

router.post('/', async (req, res) => {
  const { placa, modelo, ano, kmAtual, status } = req.body;

  const veiculo = await prisma.veiculo.create({
    data: {
      placa,
      modelo,
      ano: Number(ano),
      kmAtual: Number(kmAtual),
      status,
    },
  });

  res.status(201).json(veiculo);
});

export default router;
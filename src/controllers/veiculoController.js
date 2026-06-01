// src/controllers/veiculoController.js
import prisma from '../config/database.js';

async function listar(req, res, next) {
  try {
    const { ativo, busca } = req.query;
    const veiculos = await prisma.veiculo.findMany({
      where: {
        ativo: ativo !== undefined ? ativo === 'true' : undefined,
        OR: busca ? [
          { placa:  { contains: busca, mode: 'insensitive' } },
          { modelo: { contains: busca, mode: 'insensitive' } },
          { marca:  { contains: busca, mode: 'insensitive' } },
        ] : undefined,
      },
      orderBy: { modelo: 'asc' },
    });
    res.json(veiculos);
  } catch (err) { next(err); }
}

async function buscarPorId(req, res, next) {
  try {
    const veiculo = await prisma.veiculo.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        documentos: { orderBy: { dataVencimento: 'asc' } },
        pneus: { where: { status: { not: 'SUBSTITUIDO' } } },
        _count: { select: { abastecimentos: true, multas: true, fretes: true } },
      },
    });
    res.json(veiculo);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const veiculo = await prisma.veiculo.create({ data: req.body });
    res.status(201).json(veiculo);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const veiculo = await prisma.veiculo.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(veiculo);
  } catch (err) { next(err); }
}

async function desativar(req, res, next) {
  try {
    await prisma.veiculo.update({
      where: { id: req.params.id },
      data: { ativo: false },
    });
    res.status(204).send();
  } catch (err) { next(err); }
}

export default {
  listar,
  buscarPorId,
  criar,
  atualizar,
  desativar,
};

// src/controllers/pneuController.js
import prisma from '../config/database.js';

async function listarPorVeiculo(req, res, next) {
  try {
    const pneus = await prisma.pneu.findMany({
      where: { veiculoId: Number(req.params.veiculoId), status: { not: 'SUBSTITUIDO' } },
      include: { historico: { orderBy: { data: 'desc' }, take: 3 } },
      orderBy: { posicao: 'asc' },
    });
    res.json(pneus);
  } catch (err) { next(err); }
}

async function registrarRodizio(req, res, next) {
  try {
    const { pneuId, posicaoNova, kmAtual, observacao } = req.body;
    const pneu = await prisma.pneu.findUniqueOrThrow({ where: { id: Number(pneuId) } });
    const kmRodado = Number(kmAtual) - pneu.kmInstalado;
    const [pneuAtualizado] = await prisma.$transaction([
      prisma.pneu.update({
        where: { id: Number(pneuId) },
        data: {
          posicao: posicaoNova,
          kmInstalado: Number(kmAtual),
          kmRodado: { increment: kmRodado },
          status: calcularStatus(pneu.kmRodado + kmRodado, pneu.kmLimite),
        },
      }),
      prisma.historicoPneu.create({
        data: {
          pneuId: Number(pneuId),
          posicaoAnt: pneu.posicao,
          posicaoNov: posicaoNova,
          kmRodado,
          data: new Date(),
          observacao,
        },
      }),
    ]);
    res.json(pneuAtualizado);
  } catch (err) { next(err); }
}

async function alertasRodizio(req, res, next) {
  try {
    const pneus = await prisma.pneu.findMany({
      where: { status: { in: ['ATENCAO', 'TROCAR'] } },
      include: { veiculo: { select: { placa: true, modelo: true } } },
      orderBy: { kmRodado: 'desc' },
    });
    res.json(pneus);
  } catch (err) { next(err); }
}

function calcularStatus(kmRodado, kmLimite) {
  const pct = kmRodado / kmLimite;
  if (pct >= 1.0)  return 'TROCAR';
  if (pct >= 0.80) return 'ATENCAO';
  return 'BOM';
}

export default { listarPorVeiculo, registrarRodizio, alertasRodizio };

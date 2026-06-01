// src/controllers/abastecimentoController.js
import prisma from '../config/database.js';

async function listar(req, res, next) {
  try {
    const { veiculoId, de, ate, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      veiculoId: veiculoId || undefined,
      data: {
        gte: de  ? new Date(de)  : undefined,
        lte: ate ? new Date(ate) : undefined,
      },
    };

    const [total, registros] = await Promise.all([
      prisma.abastecimento.count({ where }),
      prisma.abastecimento.findMany({
        where,
        include: { veiculo: { select: { placa: true, modelo: true } } },
        orderBy: { data: 'desc' },
        skip,
        take: Number(limit),
      }),
    ]);

    res.json({ total, pagina: Number(page), registros });
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const { veiculoId, kmAtual, litros, valorTotal, ...resto } = req.body;

    // Busca último abastecimento para calcular consumo
    const ultimo = await prisma.abastecimento.findFirst({
      where: { veiculoId },
      orderBy: { data: 'desc' },
    });

    const kmAnterior = ultimo?.kmAtual ?? null;
    const consumoKmL = kmAnterior
      ? parseFloat(((kmAtual - kmAnterior) / litros).toFixed(2))
      : null;
    const precoPorLitro = parseFloat((valorTotal / litros).toFixed(4));

    const [abastecimento] = await prisma.$transaction([
      prisma.abastecimento.create({
        data: { veiculoId, kmAtual, kmAnterior, litros, valorTotal, precoPorLitro, consumoKmL, ...resto },
        include: { veiculo: { select: { placa: true, modelo: true } } },
      }),
      // Atualiza km atual do veículo
      prisma.veiculo.update({
        where: { id: veiculoId },
        data: { kmAtual },
      }),
      // Registra no controle de custos automaticamente
      prisma.custo.create({
        data: {
          veiculoId,
          tipo: 'COMBUSTIVEL',
          descricao: `Abastecimento ${litros}L`,
          valor: valorTotal,
          data: new Date(resto.data),
          fornecedor: resto.posto,
        },
      }),
    ]);

    res.status(201).json(abastecimento);
  } catch (err) { next(err); }
}

async function resumoPorVeiculo(req, res, next) {
  try {
    const { mes, ano } = req.query;
    const inicio = new Date(ano || new Date().getFullYear(), (mes || new Date().getMonth() + 1) - 1, 1);
    const fim    = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0, 23, 59, 59);

    const resumo = await prisma.abastecimento.groupBy({
      by: ['veiculoId'],
      where: { data: { gte: inicio, lte: fim } },
      _sum:  { litros: true, valorTotal: true },
      _avg:  { consumoKmL: true },
      _count: { id: true },
    });

    // Enriquece com dados do veículo
    const veiculoIds = resumo.map(r => r.veiculoId);
    const veiculos   = await prisma.veiculo.findMany({
      where: { id: { in: veiculoIds } },
      select: { id: true, placa: true, modelo: true },
    });
    const mapa = Object.fromEntries(veiculos.map(v => [v.id, v]));

    res.json(resumo.map(r => ({
      veiculo: mapa[r.veiculoId],
      totalLitros: r._sum.litros,
      totalValor:  r._sum.valorTotal,
      mediaConsumo: r._avg.consumoKmL ? parseFloat(r._avg.consumoKmL.toFixed(2)) : null,
      qtdAbastecimentos: r._count.id,
    })));
  } catch (err) { next(err); }
}

export default {
  listar,
  resumoPorVeiculo,
  criar,
};
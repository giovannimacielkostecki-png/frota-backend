// src/controllers/abastecimentoController.js
import prisma from '../config/database.js';

async function listar(req, res, next) {
  try {
    const { veiculoId, de, ate, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {
      veiculoId: veiculoId ? Number(veiculoId) : undefined,
      data: {
        gte: de  ? new Date(de)  : undefined,
        lte: ate ? new Date(ate) : undefined,
      },
    };
    const [total, registros] = await Promise.all([
      prisma.abastecimento.count({ where }),
      prisma.abastecimento.findMany({
        where,
        include: { veiculo: { select: { placa: true, modelo: true, motorista: true } } },
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
    const {
      veiculoId: veiculoIdRaw,
      kmAtual: kmAtualRaw,
      litros: litrosRaw,
      valorTotal: valorTotalRaw,
      litrosArla: litrosArlaRaw,
      valorArla: valorArlaRaw,
      ...resto
    } = req.body;

    const veiculoId  = Number(veiculoIdRaw);
    const kmAtual    = Number(kmAtualRaw);
    const litros     = parseFloat(litrosRaw);
    const valorTotal = parseFloat(valorTotalRaw);
    const litrosArla = litrosArlaRaw ? parseFloat(litrosArlaRaw) : undefined;
    const valorArla  = valorArlaRaw  ? parseFloat(valorArlaRaw)  : undefined;

    // Busca abastecimento anterior pelo KM (correto para inserções fora de ordem)
    const anterior = await prisma.abastecimento.findFirst({
      where: { veiculoId, kmAtual: { lt: kmAtual } },
      orderBy: { kmAtual: 'desc' },
    });
    const kmAnterior = anterior?.kmAtual ?? null;
    const consumoKmL = kmAnterior && (kmAtual - kmAnterior) > 0
      ? parseFloat(((kmAtual - kmAnterior) / litros).toFixed(2))
      : null;
    const precoPorLitro = parseFloat((valorTotal / litros).toFixed(4));
    if (resto.data) resto.data = new Date(resto.data).toISOString();

    const [abastecimento] = await prisma.$transaction([
      prisma.abastecimento.create({
        data: {
          veiculoId, kmAtual, kmAnterior, litros, valorTotal,
          precoPorLitro, consumoKmL,
          ...(litrosArla !== undefined && { litrosArla }),
          ...(valorArla  !== undefined && { valorArla }),
          ...resto,
        },
        include: { veiculo: { select: { placa: true, modelo: true, motorista: true } } },
      }),
      prisma.veiculo.update({
        where: { id: veiculoId },
        data: { kmAtual },
      }),
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

async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { kmAtual, litros, valorTotal, posto, litrosArla, valorArla, data } = req.body;
    const updated = await prisma.abastecimento.update({
      where: { id },
      data: {
        kmAtual:    kmAtual    ? Number(kmAtual)        : undefined,
        litros:     litros     ? parseFloat(litros)     : undefined,
        valorTotal: valorTotal ? parseFloat(valorTotal) : undefined,
        posto:      posto      ?? undefined,
        litrosArla: litrosArla ? parseFloat(litrosArla) : null,
        valorArla:  valorArla  ? parseFloat(valorArla)  : null,
        data:       data       ? new Date(data)         : undefined,
      },
    });
    res.json(updated);
  } catch (err) { next(err); }
}

async function deletar(req, res, next) {
  try {
    await prisma.abastecimento.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
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
    const veiculoIds = resumo.map(r => r.veiculoId);
    const veiculos   = await prisma.veiculo.findMany({
      where: { id: { in: veiculoIds } },
      select: { id: true, placa: true, modelo: true },
    });
    const mapa = Object.fromEntries(veiculos.map(v => [v.id, v]));
    res.json(resumo.map(r => ({
      veiculo: mapa[r.veiculoId],
      totalLitros:       r._sum.litros,
      totalValor:        r._sum.valorTotal,
      mediaConsumo:      r._avg.consumoKmL ? parseFloat(r._avg.consumoKmL.toFixed(2)) : null,
      qtdAbastecimentos: r._count.id,
    })));
  } catch (err) { next(err); }
}

export default {
  listar,
  resumoPorVeiculo,
  criar,
  atualizar,
  deletar,
};

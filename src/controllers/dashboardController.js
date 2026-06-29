import prisma from '../config/database.js';

async function resumo(req, res, next) {
  try {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalVeiculos,
      custosMes,
      abastecimentosMes,
      multasAbertas,
      docVencendo7,
      docVencendo15,
      docVencendo30,
      pneusAlerta,
      kmPorVeiculoMes,
    ] = await Promise.all([
      prisma.veiculo.count({ where: { ativo: true } }),

      prisma.custo.aggregate({
        where: { data: { gte: inicio, lte: fim } },
        _sum: { valor: true },
      }),

      prisma.abastecimento.aggregate({
        where: { data: { gte: inicio, lte: fim } },
        _sum: { litros: true, valorTotal: true },
        _count: { id: true },
      }),

      prisma.multa.count({ where: { status: 'ABERTA' } }),

      prisma.documento.count({
        where: {
          dataVencimento: {
            gte: hoje,
            lte: new Date(hoje.getTime() + 7 * 86400000),
          },
        },
      }),

      prisma.documento.count({
        where: {
          dataVencimento: {
            gte: hoje,
            lte: new Date(hoje.getTime() + 15 * 86400000),
          },
        },
      }),

      prisma.documento.count({
        where: {
          dataVencimento: {
            gte: hoje,
            lte: new Date(hoje.getTime() + 30 * 86400000),
          },
        },
      }),

      prisma.pneu.count({
        where: { status: { in: ['ATENCAO', 'TROCAR'] } },
      }),

      prisma.abastecimento.groupBy({
        by: ['veiculoId'],
        where: {
          data: { gte: inicio, lte: fim },
          kmAtual: { not: null },
        },
        _min: { kmAtual: true },
        _max: { kmAtual: true },
      }),
    ]);

    const kmMes = kmPorVeiculoMes.reduce((total, item) => {
      const inicial = item._min.kmAtual || 0;
      const final = item._max.kmAtual || 0;
      return total + Math.max(final - inicial, 0);
    }, 0);

    res.json({
      frota: { total: totalVeiculos },

      km: {
        kmMes,
      },

      custos: {
        totalMes: custosMes._sum.valor || 0,
      },

      abastecimento: {
        totalLitros: abastecimentosMes._sum.litros || 0,
        totalValor: abastecimentosMes._sum.valorTotal || 0,
        quantidade: abastecimentosMes._count.id,
      },

      alertas: {
        multasAbertas,
        docVencendo7,
        docVencendo15,
        docVencendo30,
        pneusAlerta,
        total: multasAbertas + docVencendo7 + pneusAlerta,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function custosMensais(req, res, next) {
  try {
    const { ano = new Date().getFullYear() } = req.query;

    const dados = await prisma.$queryRaw`
      SELECT
        EXTRACT(MONTH FROM data) AS mes,
        tipo,
        SUM(valor) AS total
      FROM "Custo"
      WHERE EXTRACT(YEAR FROM data) = ${Number(ano)}
      GROUP BY mes, tipo
      ORDER BY mes
    `;

    res.json(dados);
  } catch (err) {
    next(err);
  }
}

async function custoPorVeiculo(req, res, next) {
  try {
    const { mes, ano } = req.query;

    const inicio = new Date(
      ano || new Date().getFullYear(),
      (mes || new Date().getMonth() + 1) - 1,
      1
    );

    const fim = new Date(
      inicio.getFullYear(),
      inicio.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const custos = await prisma.custo.groupBy({
      by: ['veiculoId', 'tipo'],
      where: { data: { gte: inicio, lte: fim } },
      _sum: { valor: true },
    });

    const veiculoIds = [...new Set(custos.map(c => c.veiculoId))];

    const veiculos = await prisma.veiculo.findMany({
      where: { id: { in: veiculoIds } },
      select: { id: true, placa: true, modelo: true, kmAtual: true },
    });

    const mapaVeiculos = Object.fromEntries(veiculos.map(v => [v.id, v]));

    const agrupado = {};

    for (const c of custos) {
      if (!agrupado[c.veiculoId]) {
        agrupado[c.veiculoId] = {
          veiculo: mapaVeiculos[c.veiculoId],
          total: 0,
          porTipo: {},
        };
      }

      agrupado[c.veiculoId].porTipo[c.tipo] = c._sum.valor || 0;
      agrupado[c.veiculoId].total += c._sum.valor || 0;
    }

    res.json(Object.values(agrupado).sort((a, b) => b.total - a.total));
  } catch (err) {
    next(err);
  }
}

async function kmPorVeiculo(req, res, next) {
  try {
    const { mes, ano } = req.query;

    const hoje = new Date();
    const anoAtual = Number(ano || hoje.getFullYear());
    const mesAtual = Number(mes || hoje.getMonth() + 1);

    const inicio = new Date(anoAtual, mesAtual - 1, 1);
    const fim = new Date(anoAtual, mesAtual, 0, 23, 59, 59);

    const abastecimentos = await prisma.abastecimento.findMany({
      where: {
        data: { gte: inicio, lte: fim },
        kmAtual: { not: null },
      },
      include: {
        veiculo: {
          select: {
            id: true,
            placa: true,
            modelo: true,
          },
        },
      },
      orderBy: [
        { veiculoId: 'asc' },
        { kmAtual: 'asc' },
      ],
    });

    const agrupado = {};

    for (const abast of abastecimentos) {
      if (!agrupado[abast.veiculoId]) {
        agrupado[abast.veiculoId] = {
          veiculo: abast.veiculo,
          kmInicial: abast.kmAtual,
          kmFinal: abast.kmAtual,
        };
      }

      agrupado[abast.veiculoId].kmInicial = Math.min(
        agrupado[abast.veiculoId].kmInicial,
        abast.kmAtual
      );

      agrupado[abast.veiculoId].kmFinal = Math.max(
        agrupado[abast.veiculoId].kmFinal,
        abast.kmAtual
      );
    }

    const resultado = Object.values(agrupado)
      .map(item => ({
        veiculo: item.veiculo,
        kmInicial: item.kmInicial,
        kmFinal: item.kmFinal,
        kmRodado: item.kmFinal - item.kmInicial,
      }))
      .sort((a, b) => b.kmRodado - a.kmRodado);

    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

export default {
  resumo,
  custosMensais,
  custoPorVeiculo,
  kmPorVeiculo,
};

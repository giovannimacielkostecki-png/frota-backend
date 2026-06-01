import prisma from '../config/database.js';

async function resumo(req, res, next) {
  try {
    const hoje  = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim    = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
    const [
      totalVeiculos,
      custosMes,
      abastecimentosMes,
      multasAbertas,
      docVencendo7,
      docVencendo15,
      docVencendo30,
      pneusAlerta,
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
        where: { dataVencimento: { gte: hoje, lte: new Date(hoje.getTime() + 7 * 86400000) } },
      }),
      prisma.documento.count({
        where: { dataVencimento: { gte: hoje, lte: new Date(hoje.getTime() + 15 * 86400000) } },
      }),
      prisma.documento.count({
        where: { dataVencimento: { gte: hoje, lte: new Date(hoje.getTime() + 30 * 86400000) } },
      }),
      prisma.pneu.count({ where: { status: { in: ['ATENCAO', 'TROCAR'] } } }),
    ]);
    res.json({
      frota: { total: totalVeiculos },
      custos: { totalMes: custosMes._sum.valor || 0 },
      abastecimento: {
        totalLitros: abastecimentosMes._sum.litros || 0,
        totalValor:  abastecimentosMes._sum.valorTotal || 0,
        quantidade:  abastecimentosMes._count.id,
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
  } catch (err) { next(err); }
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
  } catch (err) { next(err); }
}

async function custoPorVeiculo(req, res, next) {
  try {
    const { mes, ano } = req.query;
    const inicio = new Date(ano || new Date().getFullYear(), (mes || new Date().getMonth() + 1) - 1, 1);
    const fim    = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0, 23, 59, 59);
    const custos = await prisma.custo.groupBy({
      by: ['veiculoId', 'tipo'],
      where: { data: { gte: inicio, lte: fim } },
      _sum: { valor: true },
    });
    const veiculoIds = [...new Set(custos.map(c => c.veiculoId))];
    const veiculos   = await prisma.veiculo.findMany({
      where: { id: { in: veiculoIds } },
      select: { id: true, placa: true, modelo: true, kmAtual: true },
    });
    const mapaVeiculos = Object.fromEntries(veiculos.map(v => [v.id, v]));
    const agrupado = {};
    for (const c of custos) {
      if (!agrupado[c.veiculoId]) {
        agrupado[c.veiculoId] = { veiculo: mapaVeiculos[c.veiculoId], total: 0, porTipo: {} };
      }
      agrupado[c.veiculoId].porTipo[c.tipo] = c._sum.valor;
      agrupado[c.veiculoId].total += c._sum.valor;
    }
    res.json(Object.values(agrupado).sort((a, b) => b.total - a.total));
  } catch (err) { next(err); }
}

export default { resumo, custosMensais, custoPorVeiculo };

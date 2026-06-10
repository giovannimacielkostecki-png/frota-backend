async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { kmAtual, litros, valorTotal, posto, litrosArla, valorArla, data } = req.body;

    // Busca o registro atual para ter o veiculoId
    const atual = await prisma.abastecimento.findUnique({ where: { id } });
    const novoKm     = kmAtual    ? Number(kmAtual)        : atual.kmAtual;
    const novosLitros = litros    ? parseFloat(litros)     : atual.litros;
    const novoValor  = valorTotal ? parseFloat(valorTotal) : atual.valorTotal;

    // Recalcula kmAnterior e consumoKmL
    const anterior = await prisma.abastecimento.findFirst({
      where: { veiculoId: atual.veiculoId, kmAtual: { lt: novoKm }, id: { not: id } },
      orderBy: { kmAtual: 'desc' },
    });
    const kmAnterior = anterior?.kmAtual ?? null;
    const consumoKmL = kmAnterior && (novoKm - kmAnterior) > 0
      ? parseFloat(((novoKm - kmAnterior) / novosLitros).toFixed(2))
      : null;
    const precoPorLitro = parseFloat((novoValor / novosLitros).toFixed(4));

    const updated = await prisma.abastecimento.update({
      where: { id },
      data: {
        kmAtual:      novoKm,
        kmAnterior,
        litros:       novosLitros,
        valorTotal:   novoValor,
        precoPorLitro,
        consumoKmL,
        posto:        posto      ?? undefined,
        litrosArla:   litrosArla ? parseFloat(litrosArla) : null,
        valorArla:    valorArla  ? parseFloat(valorArla)  : null,
        data:         data       ? new Date(data)         : undefined,
      },
    });

    // Recalcula o abastecimento SEGUINTE que depende deste kmAtual
    const proximo = await prisma.abastecimento.findFirst({
      where: { veiculoId: atual.veiculoId, kmAtual: { gt: novoKm } },
      orderBy: { kmAtual: 'asc' },
    });
    if (proximo) {
      const consumoProximo = (proximo.kmAtual - novoKm) > 0
        ? parseFloat(((proximo.kmAtual - novoKm) / proximo.litros).toFixed(2))
        : null;
      await prisma.abastecimento.update({
        where: { id: proximo.id },
        data: { kmAnterior: novoKm, consumoKmL: consumoProximo },
      });
    }

    res.json(updated);
  } catch (err) { next(err); }
}

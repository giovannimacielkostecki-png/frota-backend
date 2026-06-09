// src/controllers/freteController.js
import prisma from '../config/database.js';

function calcularValores({ distanciaKm, precoDiesel, consumoKmL, pedagio = 0, diariaMot = 0, margemLucro, custoArlaKm = 0, custoManutencaoKm = 0.40, custosFixosKm = 2.40 }) {
  const litrosNec        = distanciaKm / consumoKmL;
  const custoCombustivel = parseFloat((litrosNec * precoDiesel).toFixed(2));
  const custoDiaria      = parseFloat(diariaMot.toFixed(2));
  const custoDepreciacao = parseFloat((distanciaKm * custoManutencaoKm).toFixed(2));
  const custoPedagio     = pedagio;
  const custoArla        = parseFloat((distanciaKm * custoArlaKm).toFixed(2));
  const custosFixos      = parseFloat((distanciaKm * custosFixosKm).toFixed(2));
  const custoTotal       = parseFloat((custoCombustivel + custoPedagio + custoDiaria + custoDepreciacao + custoArla + custosFixos).toFixed(2));
  const valorFrete       = parseFloat((custoTotal * (1 + margemLucro / 100)).toFixed(2));
  return { custoCombustivel, custoPedagio, custoDiaria, custoDepreciacao, custoArla, custosFixos, custoTotal, valorFrete };
}

async function calcular(req, res, next) {
  try {
    const { distanciaKm, precoDiesel, consumoKmL, pedagio, diariaMot, margemLucro, pesoCarga, custoArlaKm, custoManutencaoKm, custosFixosKm } = req.body;
    const resultado = calcularValores({
      distanciaKm:    Number(distanciaKm),
      precoDiesel:    parseFloat(precoDiesel),
      consumoKmL:     parseFloat(consumoKmL),
      pedagio:        pedagio           ? parseFloat(pedagio)           : 0,
      diariaMot:      diariaMot         ? parseFloat(diariaMot)         : 0,
      margemLucro:    Number(margemLucro),
      custoArlaKm:    custoArlaKm       ? parseFloat(custoArlaKm)       : 0,
      custoManutencaoKm: custoManutencaoKm ? parseFloat(custoManutencaoKm) : 0.40,
      custosFixosKm:  custosFixosKm     ? parseFloat(custosFixosKm)     : 2.40,
    });
    res.json({
      ...resultado,
      distanciaKm: Number(distanciaKm),
      pesoCarga: pesoCarga || null,
      valorPorTonelada: pesoCarga ? parseFloat((resultado.valorFrete / pesoCarga).toFixed(2)) : null,
      valorPorKm: parseFloat((resultado.valorFrete / distanciaKm).toFixed(4)),
    });
  } catch (err) { next(err); }
}

async function salvar(req, res, next) {
  try {
    const {
      veiculoId, origem, destino, distanciaKm, pesoCarga,
      precoDiesel, consumoKmL, pedagio, diariaMot, margemLucro, custoArlaKm, custoManutencaoKm, custosFixosKm,
    } = req.body;
    const vals = calcularValores({
      distanciaKm:    Number(distanciaKm),
      precoDiesel:    parseFloat(precoDiesel),
      consumoKmL:     parseFloat(consumoKmL),
      pedagio:        pedagio           ? parseFloat(pedagio)           : 0,
      diariaMot:      diariaMot         ? parseFloat(diariaMot)         : 0,
      margemLucro:    Number(margemLucro) || 0,
      custoArlaKm:    custoArlaKm       ? parseFloat(custoArlaKm)       : 0,
      custoManutencaoKm: custoManutencaoKm ? parseFloat(custoManutencaoKm) : 0.40,
      custosFixosKm:  custosFixosKm     ? parseFloat(custosFixosKm)     : 2.40,
    });
    const frete = await prisma.frete.create({
      data: {
        veiculoId:        Number(veiculoId),
        usuarioId:        req.usuario?.id || null,
        origem, destino,
        distanciaKm:      Number(distanciaKm),
        pesoCarga:        pesoCarga ? Number(pesoCarga) : null,
        custoCombustivel: vals.custoCombustivel,
        custoPedagio:     vals.custoPedagio,
        custoDiaria:      vals.custoDiaria,
        custoArla:        vals.custoArla,
        custoDepreciacao: vals.custoDepreciacao,
        custosFixos:      vals.custosFixos,
        custosFixosKm:    custosFixosKm ? parseFloat(custosFixosKm) : 2.40,
        custoTotal:       vals.custoTotal,
        valorFrete:       vals.valorFrete,
      },
      include: { veiculo: { select: { placa: true, modelo: true } } },
    });
    res.status(201).json(frete);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const {
      veiculoId, origem, destino, distanciaKm, pesoCarga,
      precoDiesel, consumoKmL, pedagio, diariaMot, margemLucro, custoArlaKm, custoManutencaoKm, custosFixosKm,
    } = req.body;
    const vals = calcularValores({
      distanciaKm:    Number(distanciaKm),
      precoDiesel:    parseFloat(precoDiesel),
      consumoKmL:     parseFloat(consumoKmL),
      pedagio:        pedagio           ? parseFloat(pedagio)           : 0,
      diariaMot:      diariaMot         ? parseFloat(diariaMot)         : 0,
      margemLucro:    Number(margemLucro) || 0,
      custoArlaKm:    custoArlaKm       ? parseFloat(custoArlaKm)       : 0,
      custoManutencaoKm: custoManutencaoKm ? parseFloat(custoManutencaoKm) : 0.40,
      custosFixosKm:  custosFixosKm     ? parseFloat(custosFixosKm)     : 2.40,
    });
    const frete = await prisma.frete.update({
      where: { id: Number(req.params.id) },
      data: {
        veiculoId:        Number(veiculoId),
        origem, destino,
        distanciaKm:      Number(distanciaKm),
        pesoCarga:        pesoCarga ? Number(pesoCarga) : null,
        custoCombustivel: vals.custoCombustivel,
        custoPedagio:     vals.custoPedagio,
        custoDiaria:      vals.custoDiaria,
        custoArla:        vals.custoArla,
        custoDepreciacao: vals.custoDepreciacao,
        custosFixos:      vals.custosFixos,
        custosFixosKm:    custosFixosKm ? parseFloat(custosFixosKm) : 2.40,
        custoTotal:       vals.custoTotal,
        valorFrete:       vals.valorFrete,
      },
      include: { veiculo: { select: { placa: true, modelo: true } } },
    });
    res.json(frete);
  } catch (err) { next(err); }
}

async function deletar(req, res, next) {
  try {
    await prisma.frete.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) { next(err); }
}

async function listar(req, res, next) {
  try {
    const { veiculoId, status, page = 1, limit = 20 } = req.query;
    const fretes = await prisma.frete.findMany({
      where: {
        veiculoId: veiculoId ? Number(veiculoId) : undefined,
        status:    status    || undefined,
      },
      include: {
        veiculo: { select: { placa: true, modelo: true } },
        usuario: { select: { nome: true } },
      },
      orderBy: { criadoEm: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });
    res.json(fretes);
  } catch (err) { next(err); }
}

async function atualizarStatus(req, res, next) {
  try {
    const frete = await prisma.frete.update({
      where: { id: Number(req.params.id) },
      data:  { status: req.body.status, dataChegada: req.body.dataChegada },
    });
    res.json(frete);
  } catch (err) { next(err); }
}

export default { calcular, salvar, atualizar, deletar, listar, atualizarStatus };

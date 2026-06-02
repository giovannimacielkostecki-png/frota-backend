// src/controllers/freteController.js
import prisma from '../config/database.js';

function calcularValores({ distanciaKm, precoDiesel, consumoKmL, pedagio = 0, diariaMot = 0, margemLucro }) {
  const litrosNec        = distanciaKm / consumoKmL;
  const custoCombustivel = parseFloat((litrosNec * precoDiesel).toFixed(2));
  const custoDiaria      = parseFloat((diariaMot * (distanciaKm / 500)).toFixed(2));
  const custoDepreciacao = parseFloat((distanciaKm * 0.15).toFixed(2));
  const custoPedagio     = pedagio;
  const custoTotal       = parseFloat((custoCombustivel + custoPedagio + custoDiaria + custoDepreciacao).toFixed(2));
  const valorFrete       = parseFloat((custoTotal * (1 + margemLucro / 100)).toFixed(2));
  return { custoCombustivel, custoPedagio, custoDiaria, custoDepreciacao, custoTotal, valorFrete };
}

async function calcular(req, res, next) {
  try {
    const { distanciaKm, precoDiesel, consumoKmL, pedagio, diariaMot, margemLucro, pesoCarga } = req.body;
    const resultado = calcularValores({
      distanciaKm: Number(distanciaKm),
      precoDiesel:  parseFloat(precoDiesel),
      consumoKmL:   parseFloat(consumoKmL),
      pedagio:      pedagio   ? parseFloat(pedagio)   : 0,
      diariaMot:    diariaMot ? parseFloat(diariaMot) : 0,
      margemLucro:  Number(margemLucro),
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
    const { veiculoId, precoDiesel, consumoKmL, ...dados } = req.body;
    const vals = calcularValores({
      ...dados,
      distanciaKm: Number(dados.distanciaKm),
      precoDiesel:  parseFloat(precoDiesel),
      consumoKmL:   parseFloat(consumoKmL),
      pedagio:      dados.pedagio   ? parseFloat(dados.pedagio)   : 0,
      diariaMot:    dados.diariaMot ? parseFloat(dados.diariaMot) : 0,
      margemLucro:  Number(dados.margemLucro),
    });
    const frete = await prisma.frete.create({
      data: {
        veiculoId:  Number(veiculoId),
        usuarioId:  req.usuario.id,
        ...dados,
        ...vals,
      },
      include: { veiculo: { select: { placa: true, modelo: true } } },
    });
    res.status(201).json(frete);
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

export default { calcular, salvar, listar, atualizarStatus };

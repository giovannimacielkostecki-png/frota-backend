// src/controllers/multaController.js
import prisma from '../config/database.js';
import axios from 'axios';

// Consulta DETRAN/SINESP via API (Serpro ou similar)
async function consultarPorPlaca(req, res, next) {
  try {
    const { placa } = req.params;

    // Registro local
    const multasLocais = await prisma.multa.findMany({
      where: { veiculo: { placa: { equals: placa, mode: 'insensitive' } } },
      orderBy: { dataInfracao: 'desc' },
    });

    // Consulta API externa (quando disponível)
    let multasExternas = [];
    if (process.env.SINESP_API_KEY) {
      try {
        const { data } = await axios.get(`${process.env.SINESP_API_URL}/multas/${placa}`, {
          headers: { Authorization: `Bearer ${process.env.SINESP_API_KEY}` },
          timeout: 8000,
        });
        multasExternas = data.multas || [];
      } catch (e) {
        console.warn('[SINESP] API indisponível, usando apenas dados locais');
      }
    }

    res.json({ placa, multasLocais, multasExternas });
  } catch (err) { next(err); }
}

async function listar(req, res, next) {
  try {
    const { status, veiculoId } = req.query;
    const multas = await prisma.multa.findMany({
      where: {
        status:    status    || undefined,
        veiculoId: veiculoId || undefined,
      },
      include: { veiculo: { select: { placa: true, modelo: true } } },
      orderBy: { dataVencimento: 'asc' },
    });
    res.json(multas);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const multa = await prisma.multa.create({
      data: req.body,
      include: { veiculo: { select: { placa: true } } },
    });
    // Registra custo automaticamente
    await prisma.custo.create({
      data: {
        veiculoId: multa.veiculoId,
        tipo: 'MULTA',
        descricao: `Multa auto ${multa.numeroAuto}`,
        valor: multa.valor,
        data: multa.dataInfracao,
      },
    });
    res.status(201).json(multa);
  } catch (err) { next(err); }
}

async function registrarPagamento(req, res, next) {
  try {
    const multa = await prisma.multa.update({
      where: { id: req.params.id },
      data: { status: 'PAGA', dataPagamento: new Date() },
    });
    res.json(multa);
  } catch (err) { next(err); }
}

export default {
  consultarPorPlaca,
  listar,
  criar,
  registrarPagamento,
};

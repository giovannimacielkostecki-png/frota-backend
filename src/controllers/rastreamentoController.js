// src/controllers/rastreamentoController.js
import prisma from '../config/database.js';

import { buscarPosicaoGPS } from '../services/gpsService.js';

// Posição atual de todos os veículos
async function posicaoAtual(req, res, next) {
  try {
    const veiculos = await prisma.veiculo.findMany({
      where: { ativo: true },
      select: { id: true, placa: true, modelo: true },
    });

    const posicoes = await Promise.all(
      veiculos.map(async (v) => {
        const ultimaPos = await prisma.rastreamento.findFirst({
          where: { veiculoId: v.id },
          orderBy: { criadoEm: 'desc' },
        });
        return { veiculo: v, posicao: ultimaPos };
      })
    );

    res.json(posicoes.filter(p => p.posicao !== null));
  } catch (err) { next(err); }
}

// Histórico de rota de um veículo
async function historicoPorVeiculo(req, res, next) {
  try {
    const { veiculoId } = req.params;
    const { de, ate, limit = 500 } = req.query;

    const pontos = await prisma.rastreamento.findMany({
      where: {
        veiculoId,
        criadoEm: {
          gte: de  ? new Date(de)  : new Date(Date.now() - 24 * 3600000),
          lte: ate ? new Date(ate) : new Date(),
        },
      },
      orderBy: { criadoEm: 'asc' },
      take: Number(limit),
    });

    res.json(pontos);
  } catch (err) { next(err); }
}

// Recebe ping do rastreador (webhook ou pooling interno)
async function registrarPosicao(req, res, next) {
  try {
    const { veiculoId, latitude, longitude, velocidade, ignicao, hodometro } = req.body;
    const ponto = await prisma.rastreamento.create({
      data: { veiculoId, latitude, longitude, velocidade, ignicao, hodometro },
    });

    // Atualiza km do veículo se hodômetro informado
    if (hodometro) {
      await prisma.veiculo.update({
        where: { id: veiculoId },
        data: { kmAtual: hodometro },
      });
    }

    res.status(201).json(ponto);
  } catch (err) { next(err); }
}

// Sincroniza posição com provedor externo de GPS
async function sincronizarGPS(req, res, next) {
  try {
    const resultado = await buscarPosicaoGPS();
    res.json({ sincronizados: resultado.length, posicoes: resultado });
  } catch (err) { next(err); }
}

export default {
  posicaoAtual,
  historicoPorVeiculo,
  registrarPosicao,
  sincronizarGPS,
};
// src/services/gpsService.js
// Abstração para integrar com diferentes provedores de rastreamento
import axios from 'axios';

import prisma from '../config/database.js';

async function buscarPosicaoGPS() {
  const provider = process.env.GPS_PROVIDER || 'mock';

  switch (provider) {
    case 'sascar':   return _buscarSascar();
    case 'omnilink': return _buscarOmnilink();
    case 'positron': return _buscarPositron();
    default:         return _mockPosicoes();
  }
}

// ── Sascar ───────────────────────────────────
async function _buscarSascar() {
  const { data } = await axios.get(`${process.env.GPS_API_URL}/v1/vehicles/positions`, {
    headers: { 'x-api-key': process.env.GPS_API_KEY },
    timeout: 10000,
  });

  return _salvarPosicoes(
    data.vehicles.map(v => ({
      placa:      v.plate,
      latitude:   v.lat,
      longitude:  v.lng,
      velocidade: v.speed,
      ignicao:    v.ignition,
      hodometro:  v.odometer,
    }))
  );
}

// ── Omnilink ──────────────────────────────────
async function _buscarOmnilink() {
  const { data } = await axios.post(`${process.env.GPS_API_URL}/api/positions`, {
    apiKey: process.env.GPS_API_KEY,
  }, { timeout: 10000 });

  return _salvarPosicoes(
    data.map(v => ({
      placa:      v.licensePlate,
      latitude:   v.latitude,
      longitude:  v.longitude,
      velocidade: v.speed,
      ignicao:    v.ignitionStatus === 'ON',
      hodometro:  v.mileage,
    }))
  );
}

// ── Positron ──────────────────────────────────
async function _buscarPositron() {
  const { data } = await axios.get(`${process.env.GPS_API_URL}/rastreamento/posicoes`, {
    params: { token: process.env.GPS_API_KEY },
    timeout: 10000,
  });

  return _salvarPosicoes(
    data.veiculos.map(v => ({
      placa:      v.placa,
      latitude:   v.lat,
      longitude:  v.lon,
      velocidade: v.velocidade,
      ignicao:    v.ignicao,
      hodometro:  v.hodometro,
    }))
  );
}

// ── Salva no banco buscando veículo por placa ──
async function _salvarPosicoes(posicoes) {
  const resultados = [];
  for (const pos of posicoes) {
    const veiculo = await prisma.veiculo.findUnique({ where: { placa: pos.placa } });
    if (!veiculo) continue;

    const registro = await prisma.rastreamento.create({
      data: {
        veiculoId:  veiculo.id,
        latitude:   pos.latitude,
        longitude:  pos.longitude,
        velocidade: pos.velocidade || 0,
        ignicao:    pos.ignicao    || false,
        hodometro:  pos.hodometro  || null,
      },
    });
    resultados.push(registro);
  }
  return resultados;
}

// ── Mock para desenvolvimento ──────────────────
async function _mockPosicoes() {
  const veiculos = await prisma.veiculo.findMany({ where: { ativo: true }, take: 5 });
  const base = [
    { lat: -23.5505, lng: -46.6333 },  // São Paulo
    { lat: -25.4290, lng: -49.2671 },  // Curitiba
    { lat: -22.9068, lng: -43.1729 },  // Rio de Janeiro
    { lat: -19.9167, lng: -43.9345 },  // Belo Horizonte
    { lat: -30.0331, lng: -51.2300 },  // Porto Alegre
  ];

  return _salvarPosicoes(
    veiculos.map((v, i) => ({
      placa:      v.placa,
      latitude:   base[i % base.length].lat + (Math.random() - 0.5) * 0.1,
      longitude:  base[i % base.length].lng + (Math.random() - 0.5) * 0.1,
      velocidade: Math.floor(Math.random() * 100),
      ignicao:    Math.random() > 0.3,
      hodometro:  v.kmAtual + Math.random() * 10,
    }))
  );
}

export {
  buscarPosicaoGPS,
};
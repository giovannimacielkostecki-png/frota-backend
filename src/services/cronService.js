// src/services/cronService.js
// Jobs agendados: alertas de vencimento, sincronização GPS, atualização de km de pneus
const cron   = require('node-cron');
const prisma = require('../config/database');
const { enviarAlertaVencimento } = require('./emailService');
const { buscarPosicaoGPS }       = require('./gpsService');

function iniciarCronJobs() {
  // ── Alertas de vencimento: todo dia às 08:00 ──
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Verificando vencimentos...');
    try {
      const hoje     = new Date();
      const em30dias = new Date(hoje.getTime() + 30 * 86400000);

      const docs = await prisma.documento.findMany({
        where: {
          dataVencimento: { gte: hoje, lte: em30dias },
          alertaEnviado: false,
        },
        include: { veiculo: { select: { placa: true, modelo: true } } },
      });

      for (const doc of docs) {
        const diasRestantes = Math.ceil((doc.dataVencimento - hoje) / 86400000);
        if ([7, 15, 30].includes(diasRestantes)) {
          await enviarAlertaVencimento(doc, diasRestantes);
          await prisma.documento.update({
            where: { id: doc.id },
            data: { alertaEnviado: true },
          });
          console.log(`[CRON] Alerta enviado: ${doc.tipo} · ${doc.veiculo.placa} · ${diasRestantes} dias`);
        }
      }
    } catch (err) {
      console.error('[CRON] Erro ao verificar vencimentos:', err.message);
    }
  });

  // ── Sincronização GPS: a cada 30 segundos ──
  const intervaloGPS = Number(process.env.GPS_POLL_INTERVAL || 30);
  cron.schedule(`*/${intervaloGPS} * * * * *`, async () => {
    try {
      await buscarPosicaoGPS();
    } catch (err) {
      console.error('[CRON] Erro ao sincronizar GPS:', err.message);
    }
  });

  // ── Atualização de status de pneus: todo dia à meia-noite ──
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Atualizando status dos pneus...');
    try {
      const pneus = await prisma.pneu.findMany({
        where: { status: { not: 'SUBSTITUIDO' } },
      });

      for (const p of pneus) {
        const pct = p.kmRodado / p.kmLimite;
        const novoStatus = pct >= 1.0 ? 'TROCAR' : pct >= 0.80 ? 'ATENCAO' : 'BOM';
        if (novoStatus !== p.status) {
          await prisma.pneu.update({ where: { id: p.id }, data: { status: novoStatus } });
        }
      }
    } catch (err) {
      console.error('[CRON] Erro ao atualizar pneus:', err.message);
    }
  });

  console.log('[CRON] Jobs iniciados: alertas (08h), GPS (30s), pneus (00h)');
}

module.exports = { iniciarCronJobs };

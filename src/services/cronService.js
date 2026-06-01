// src/services/cronService.js
import cron from 'node-cron';
import prisma from '../config/database.js';
import { enviarAlertaVencimento } from './emailService.js';
import { buscarPosicaoGPS } from './gpsService.js';

function iniciarCronJobs() {
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Verificando vencimentos...');
    try {
      const hoje = new Date();
      const em30dias = new Date(hoje.getTime() + 30 * 86400000);
      const docs = await prisma.documento.findMany({
        where: {
          dataVencimento: { gte: hoje, lte: em30dias },
        },
        include: { veiculo: { select: { placa: true, modelo: true } } },
      });
      for (const doc of docs) {
        const diasRestantes = Math.ceil((doc.dataVencimento - hoje) / 86400000);
        if ([7, 15, 30].includes(diasRestantes)) {
          await enviarAlertaVencimento(doc, diasRestantes);
          console.log(`[CRON] Alerta: ${doc.tipo} · ${doc.veiculo.placa} · ${diasRestantes} dias`);
        }
      }
    } catch (err) {
      console.error('[CRON] Erro vencimentos:', err.message);
    }
  });

  const intervaloGPS = Number(process.env.GPS_POLL_INTERVAL || 30);
  cron.schedule(`*/${intervaloGPS} * * * * *`, async () => {
    try {
      await buscarPosicaoGPS();
    } catch (err) {
      console.error('[CRON] Erro GPS:', err.message);
    }
  });

  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Atualizando pneus...');
    try {
      const pneus = await prisma.pneu.findMany({
        where: { status: { not: 'SUBSTITUIDO' } },
      });
      for (const p of pneus) {
        const pct = (p.kmAtual - p.kmInstalado) / 80000;
        const novoStatus = pct >= 1.0 ? 'TROCAR' : pct >= 0.80 ? 'ATENCAO' : 'BOM';
        if (novoStatus !== p.status) {
          await prisma.pneu.update({ where: { id: p.id }, data: { status: novoStatus } });
        }
      }
    } catch (err) {
      console.error('[CRON] Erro pneus:', err.message);
    }
  });

  console.log('[CRON] Jobs iniciados');
}

export { iniciarCronJobs };

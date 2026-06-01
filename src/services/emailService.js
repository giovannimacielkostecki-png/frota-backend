// src/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const LABELS = {
  IPVA:               '📋 IPVA',
  LICENCIAMENTO:      '🪪 Licenciamento',
  SEGURO_OBRIGATORIO: '🛡️ Seguro Obrigatório',
  SEGURO_OPCIONAL:    '🛡️ Seguro Opcional',
  SINISTRO:           '⚠️ Sinistro',
  OUTROS:             '📄 Documento',
};

async function enviarAlertaVencimento(doc, diasRestantes) {
  const tipo  = LABELS[doc.tipo] || doc.tipo;
  const placa = doc.veiculo.placa;
  const data  = doc.dataVencimento.toLocaleDateString('pt-BR');
  const urgencia = diasRestantes <= 7 ? '🚨 URGENTE' : diasRestantes <= 15 ? '⚠️ ATENÇÃO' : '📅 Aviso';

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
      <div style="background:#0d1117;padding:20px;text-align:center">
        <h1 style="color:#f0a500;margin:0;font-size:22px">🚛 FrotaPRO</h1>
      </div>
      <div style="padding:24px">
        <h2 style="color:#333">${urgencia} — Documento vencendo em ${diasRestantes} dias</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;color:#666">Veículo</td><td style="padding:8px;font-weight:bold">${doc.veiculo.modelo} — ${placa}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Documento</td><td style="padding:8px;font-weight:bold">${tipo}</td></tr>
          <tr><td style="padding:8px;color:#666">Vencimento</td><td style="padding:8px;font-weight:bold;color:${diasRestantes <= 7 ? '#e53935' : '#f57c00'}">${data}</td></tr>
          ${doc.valor ? `<tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Valor</td><td style="padding:8px;font-weight:bold">R$ ${doc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>` : ''}
        </table>
        <p style="margin-top:20px;color:#666;font-size:14px">Regularize o documento para evitar problemas na operação da frota.</p>
      </div>
      <div style="background:#f5f5f5;padding:12px;text-align:center;font-size:12px;color:#999">
        FrotaPRO — Sistema de Gestão de Frota
      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      process.env.EMAIL_DESTINO_ALERTAS || process.env.SMTP_USER,
    subject: `${urgencia}: ${tipo} do veículo ${placa} vence em ${diasRestantes} dias`,
    html,
  });
}

module.exports = { enviarAlertaVencimento };

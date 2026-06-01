// src/services/emailService.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const LABELS = {
  IPVA: 'IPVA',
  LICENCIAMENTO: 'Licenciamento',
  SEGURO_OBRIGATORIO: 'Seguro Obrigatório',
  SEGURO_OPCIONAL: 'Seguro Opcional',
  OUTROS: 'Documento',
};

async function enviarAlertaVencimento(doc, diasRestantes) {
  const tipo = LABELS[doc.tipo] || doc.tipo;
  const placa = doc.veiculo.placa;
  const data = doc.dataVencimento.toLocaleDateString('pt-BR');

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_DESTINO_ALERTAS || process.env.SM

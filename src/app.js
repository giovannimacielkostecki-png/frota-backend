// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import veiculosRoutes from './routes/veiculos.routes.js';

import authRoutes from './routes/authRoutes.js';
import veiculoRoutes from './routes/veiculoRoutes.js';
import abastecimentoRoutes from './routes/abastecimentoRoutes.js';
import pneuRoutes from './routes/pneuRoutes.js';
import documentoRoutes from './routes/documentoRoutes.js';
import multaRoutes from './routes/multaRoutes.js';
import custoRoutes from './routes/custoRoutes.js';
import freteRoutes from './routes/freteRoutes.js';
import rastreamentoRoutes from './routes/rastreamentoRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// ── Middlewares globais ──────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));
app.get('/debug', (req, res) => {
  res.json({ 
    status: 'ok',
    env: process.env.NODE_ENV,
    db: !!process.env.DATABASE_URL
  });
});

// ── Rotas ────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/veiculos',      veiculoRoutes);
app.use('/api/abastecimentos',abastecimentoRoutes);
app.use('/api/pneus',         pneuRoutes);
app.use('/api/documentos',    documentoRoutes);
app.use('/api/multas',        multaRoutes);
app.use('/api/custos',        custoRoutes);
app.use('/api/fretes',        freteRoutes);
app.use('/api/rastreamento',  rastreamentoRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/veiculos', veiculosRoutes);


// ── Health check ─────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

app.get('/', (req, res) => {
  res.send('FrotaPRO Backend Online 🚛');
});

// ── 404 ──────────────────────────────────────
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

// ── Tratamento de erros ──────────────────────
app.use(errorHandler);

export default app;

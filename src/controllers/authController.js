// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import prisma from '../config/database.js';

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
    }

    if (!usuario.ativo) {
      return res.status(401).json({ erro: 'Conta desativada' });
    }

    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function cadastrar(req, res, next) {
  try {
    const { nome, email, senha, perfil } = req.body;

    const hash = await bcrypt.hash(senha, 12);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hash,
        perfil,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
      },
    });

    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
}

async function perfil(req, res) {
  res.json(req.usuario);
}

export default {
  login,
  cadastrar,
  perfil,
};

import jwt from 'jsonwebtoken';

import prisma from '../config/database.js';

async function autenticar(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({
      erro: 'Token não fornecido',
    });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        ativo: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({
        erro: 'Usuário inativo ou não encontrado',
      });
    }

    req.usuario = usuario;

    next();

  } catch {
    return res.status(401).json({
      erro: 'Token inválido ou expirado',
    });
  }
}

function autorizar(...perfis) {
  return (req, res, next) => {

    if (!perfis.includes(req.usuario.perfil)) {
      return res.status(403).json({
        erro: 'Acesso negado para este perfil',
      });
    }

    next();
  };
}

export {
  autenticar,
  autorizar,
};
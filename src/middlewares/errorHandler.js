export function errorHandler(err, req, res, next) {
  console.error('[ERRO]', err);

  if (err.code === 'P2002') {
    return res.status(409).json({
      erro: 'Registro duplicado',
      campo: err.meta?.target,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      erro: 'Registro não encontrado',
    });
  }

  if (err.status) {
    return res.status(err.status).json({
      erro: err.message,
    });
  }

  res.status(500).json({
    erro: 'Erro interno do servidor',
  });
}
import prisma from '../config/database.js';

async function listar(req, res, next) {
  try {
    const rotas = await prisma.rota.findMany({ where: { ativo: true }, orderBy: { criadoEm: 'desc' } });
    res.json(rotas);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const { origem, destino, kmEstimado } = req.body;
    const rota = await prisma.rota.create({ data: { origem: String(origem).trim(), destino: String(destino).trim(), kmEstimado: Number(kmEstimado) } });
    res.status(201).json(rota);
  } catch (err) { next(err); }
}

async function deletar(req, res, next) {
  try {
    await prisma.rota.update({ where: { id: Number(req.params.id) }, data: { ativo: false } });
    res.status(204).send();
  } catch (err) { next(err); }
}

export default { listar, criar, deletar };

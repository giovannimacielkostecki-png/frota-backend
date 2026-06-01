// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const senhaHash = await bcrypt.hash('frota123', 12);

  await prisma.usuario.upsert({
    where: { email: 'admin@frota.com' },
    update: {},
    create: { nome: 'Administrador', email: 'admin@frota.com', senha: senhaHash, perfil: 'ADMIN' },
  });

  await prisma.usuario.upsert({
    where: { email: 'gestor@frota.com' },
    update: {},
    create: { nome: 'Gestor da Frota', email: 'gestor@frota.com', senha: senhaHash, perfil: 'GESTOR' },
  });

  await prisma.usuario.upsert({
    where: { email: 'joao@frota.com' },
    update: {},
    create: { nome: 'João Silva', email: 'joao@frota.com', senha: senhaHash, perfil: 'MOTORISTA' },
  });

  const veiculos = await Promise.all([
    prisma.veiculo.upsert({
      where: { placa: 'BRA2E19' },
      update: {},
      create: { placa: 'BRA2E19', modelo: 'FH 540', marca: 'Volvo', ano: 2021, renavam: '12345678901', chassi: '9BW123456789012341', kmAtual: 142450 },
    }),
    prisma.veiculo.upsert({
      where: { placa: 'CAM3F21' },
      update: {},
      create: { placa: 'CAM3F21', modelo: 'R450', marca: 'Scania', ano: 2020, renavam: '12345678902', chassi: '9BW123456789012342', kmAtual: 98200 },
    }),
    prisma.veiculo.upsert({
      where: { placa: 'DEF4G33' },
      update: {},
      create: { placa: 'DEF4G33', modelo: 'Actros', marca: 'Mercedes', ano: 2019, renavam: '12345678903', chassi: '9BW123456789012343', kmAtual: 67100 },
    }),
  ]);

  const hoje = new Date();
  await prisma.documento.createMany({
    data: [
      { veiculoId: veiculos[0].id, tipo: 'IPVA', dataVencimento: new Date(hoje.getTime() + 7 * 86400000), valor: 4200 },
      { veiculoId: veiculos[1].id, tipo: 'SEGURO_OPCIONAL', dataVencimento: new Date(hoje.getTime() + 15 * 86400000), valor: 12400 },
      { veiculoId: veiculos[2].id, tipo: 'LICENCIAMENTO', dataVencimento: new Date(hoje.getTime() + 12 * 86400000), valor: 180 },
    ],
    skipDuplicates: true,
  });

  await prisma.multa.upsert({
    where: { numeroAuto: '293847' },
    update: {},
    create: {
      veiculoId: veiculos[1].id,
      numeroAuto: '293847',
      descricao: 'Excesso de velocidade',
      local: 'Rodovia Anhanguera km 105',
      dataInfracao: new Date('2025-05-18'),
      dataVencimento: new Date('2025-06-18'),
      valor: 293.47,
      pontos: 5,
    },
  });

  console.log('✅ Seed concluído!');
  console.log('Admin: admin@frota.com / frota123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

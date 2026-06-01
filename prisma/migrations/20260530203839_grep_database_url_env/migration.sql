-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ADMIN', 'GESTOR', 'MOTORISTA');

-- CreateEnum
CREATE TYPE "Combustivel" AS ENUM ('DIESEL', 'GASOLINA', 'ETANOL', 'GNV', 'ELETRICO');

-- CreateEnum
CREATE TYPE "StatusPneu" AS ENUM ('BOM', 'ATENCAO', 'TROCAR', 'SUBSTITUIDO');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('IPVA', 'LICENCIAMENTO', 'SEGURO_OBRIGATORIO', 'SEGURO_OPCIONAL', 'SINISTRO', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusMulta" AS ENUM ('ABERTA', 'PAGA', 'RECORRIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoCusto" AS ENUM ('COMBUSTIVEL', 'MANUTENCAO', 'PNEU', 'MULTA', 'SEGURO', 'IPVA', 'LICENCIAMENTO', 'PEDAGIO', 'LAVAGEM', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusFrete" AS ENUM ('CALCULADO', 'CONFIRMADO', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL DEFAULT 'MOTORISTA',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "renavam" TEXT NOT NULL,
    "chassi" TEXT NOT NULL,
    "cor" TEXT,
    "combustivel" "Combustivel" NOT NULL DEFAULT 'DIESEL',
    "kmAtual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abastecimentos" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "kmAtual" DOUBLE PRECISION NOT NULL,
    "kmAnterior" DOUBLE PRECISION,
    "litros" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "precoPorLitro" DOUBLE PRECISION NOT NULL,
    "consumoKmL" DOUBLE PRECISION,
    "posto" TEXT,
    "cidade" TEXT,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abastecimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pneus" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "posicao" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "medida" TEXT,
    "kmInstalado" DOUBLE PRECISION NOT NULL,
    "kmRodado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kmLimite" DOUBLE PRECISION NOT NULL DEFAULT 40000,
    "status" "StatusPneu" NOT NULL DEFAULT 'BOM',
    "dataInstalacao" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pneus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_pneus" (
    "id" TEXT NOT NULL,
    "pneuId" TEXT NOT NULL,
    "posicaoAnt" TEXT NOT NULL,
    "posicaoNov" TEXT NOT NULL,
    "kmRodado" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_pneus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "descricao" TEXT,
    "dataEmissao" TIMESTAMP(3),
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION,
    "seguradora" TEXT,
    "numeroApolice" TEXT,
    "alertaEnviado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "multas" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "numeroAuto" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "local" TEXT,
    "dataInfracao" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "valorDesconto" DOUBLE PRECISION,
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "status" "StatusMulta" NOT NULL DEFAULT 'ABERTA',
    "dataPagamento" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "multas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custos" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "tipo" "TipoCusto" NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "fornecedor" TEXT,
    "notaFiscal" TEXT,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fretes" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "distanciaKm" DOUBLE PRECISION NOT NULL,
    "pesoCarga" DOUBLE PRECISION,
    "valorFrete" DOUBLE PRECISION NOT NULL,
    "custoCombustivel" DOUBLE PRECISION NOT NULL,
    "custoPedagio" DOUBLE PRECISION,
    "custoDiaria" DOUBLE PRECISION,
    "custoTotal" DOUBLE PRECISION NOT NULL,
    "margemLucro" DOUBLE PRECISION NOT NULL,
    "status" "StatusFrete" NOT NULL DEFAULT 'CALCULADO',
    "dataSaida" TIMESTAMP(3),
    "dataChegada" TIMESTAMP(3),
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fretes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rastreamentos" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "velocidade" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "direcao" DOUBLE PRECISION,
    "ignicao" BOOLEAN NOT NULL DEFAULT false,
    "altitude" DOUBLE PRECISION,
    "hodometro" DOUBLE PRECISION,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rastreamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_renavam_key" ON "veiculos"("renavam");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_chassi_key" ON "veiculos"("chassi");

-- CreateIndex
CREATE UNIQUE INDEX "multas_numeroAuto_key" ON "multas"("numeroAuto");

-- CreateIndex
CREATE INDEX "rastreamentos_veiculoId_criadoEm_idx" ON "rastreamentos"("veiculoId", "criadoEm");

-- AddForeignKey
ALTER TABLE "abastecimentos" ADD CONSTRAINT "abastecimentos_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abastecimentos" ADD CONSTRAINT "abastecimentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pneus" ADD CONSTRAINT "pneus_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_pneus" ADD CONSTRAINT "historico_pneus_pneuId_fkey" FOREIGN KEY ("pneuId") REFERENCES "pneus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "multas" ADD CONSTRAINT "multas_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custos" ADD CONSTRAINT "custos_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fretes" ADD CONSTRAINT "fretes_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fretes" ADD CONSTRAINT "fretes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rastreamentos" ADD CONSTRAINT "rastreamentos_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

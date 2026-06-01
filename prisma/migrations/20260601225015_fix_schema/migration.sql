/*
  Warnings:

  - You are about to drop the column `km` on the `Abastecimento` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `Abastecimento` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[renavam]` on the table `Veiculo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chassi]` on the table `Veiculo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kmAtual` to the `Abastecimento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorTotal` to the `Abastecimento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Abastecimento" DROP COLUMN "km",
DROP COLUMN "valor",
ADD COLUMN     "consumoKmL" DOUBLE PRECISION,
ADD COLUMN     "kmAnterior" INTEGER,
ADD COLUMN     "kmAtual" INTEGER NOT NULL,
ADD COLUMN     "precoPorLitro" DOUBLE PRECISION,
ADD COLUMN     "tipoCombustivel" TEXT,
ADD COLUMN     "valorTotal" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Veiculo" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "chassi" TEXT,
ADD COLUMN     "marca" TEXT,
ADD COLUMN     "renavam" TEXT;

-- CreateTable
CREATE TABLE "Pneu" (
    "id" SERIAL NOT NULL,
    "posicao" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "kmInstalado" INTEGER NOT NULL DEFAULT 0,
    "kmAtual" INTEGER NOT NULL DEFAULT 0,
    "kmRodado" INTEGER NOT NULL DEFAULT 0,
    "kmLimite" INTEGER NOT NULL DEFAULT 80000,
    "status" TEXT NOT NULL DEFAULT 'BOM',
    "veiculoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pneu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoPneu" (
    "id" SERIAL NOT NULL,
    "posicaoAnt" TEXT NOT NULL,
    "posicaoNov" TEXT NOT NULL,
    "kmRodado" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "pneuId" INTEGER NOT NULL,

    CONSTRAINT "HistoricoPneu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valor" DOUBLE PRECISION,
    "observacao" TEXT,
    "veiculoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Multa" (
    "id" SERIAL NOT NULL,
    "numeroAuto" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "local" TEXT,
    "dataInfracao" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3),
    "dataPagamento" TIMESTAMP(3),
    "valor" DOUBLE PRECISION NOT NULL,
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "paga" BOOLEAN NOT NULL DEFAULT false,
    "veiculoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Multa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Custo" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fornecedor" TEXT,
    "veiculoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Custo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Frete" (
    "id" SERIAL NOT NULL,
    "origem" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "distanciaKm" DOUBLE PRECISION,
    "pesoCarga" DOUBLE PRECISION,
    "custoCombustivel" DOUBLE PRECISION,
    "custoPedagio" DOUBLE PRECISION,
    "custoDiaria" DOUBLE PRECISION,
    "custoDepreciacao" DOUBLE PRECISION,
    "custoTotal" DOUBLE PRECISION,
    "valorFrete" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataChegada" TIMESTAMP(3),
    "veiculoId" INTEGER NOT NULL,
    "usuarioId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Frete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rastreamento" (
    "id" SERIAL NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "velocidade" DOUBLE PRECISION,
    "ignicao" BOOLEAN NOT NULL DEFAULT false,
    "hodometro" DOUBLE PRECISION,
    "veiculoId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rastreamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Multa_numeroAuto_key" ON "Multa"("numeroAuto");

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_renavam_key" ON "Veiculo"("renavam");

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_chassi_key" ON "Veiculo"("chassi");

-- AddForeignKey
ALTER TABLE "Pneu" ADD CONSTRAINT "Pneu_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoPneu" ADD CONSTRAINT "HistoricoPneu_pneuId_fkey" FOREIGN KEY ("pneuId") REFERENCES "Pneu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Multa" ADD CONSTRAINT "Multa_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Custo" ADD CONSTRAINT "Custo_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frete" ADD CONSTRAINT "Frete_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frete" ADD CONSTRAINT "Frete_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rastreamento" ADD CONSTRAINT "Rastreamento_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

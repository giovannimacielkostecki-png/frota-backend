/*
  Warnings:

  - You are about to drop the `abastecimentos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `custos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `documentos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fretes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `historico_pneus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `multas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pneus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rastreamentos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `veiculos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "abastecimentos" DROP CONSTRAINT "abastecimentos_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "abastecimentos" DROP CONSTRAINT "abastecimentos_veiculoId_fkey";

-- DropForeignKey
ALTER TABLE "custos" DROP CONSTRAINT "custos_veiculoId_fkey";

-- DropForeignKey
ALTER TABLE "documentos" DROP CONSTRAINT "documentos_veiculoId_fkey";

-- DropForeignKey
ALTER TABLE "fretes" DROP CONSTRAINT "fretes_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "fretes" DROP CONSTRAINT "fretes_veiculoId_fkey";

-- DropForeignKey
ALTER TABLE "historico_pneus" DROP CONSTRAINT "historico_pneus_pneuId_fkey";

-- DropForeignKey
ALTER TABLE "multas" DROP CONSTRAINT "multas_veiculoId_fkey";

-- DropForeignKey
ALTER TABLE "pneus" DROP CONSTRAINT "pneus_veiculoId_fkey";

-- DropForeignKey
ALTER TABLE "rastreamentos" DROP CONSTRAINT "rastreamentos_veiculoId_fkey";

-- DropTable
DROP TABLE "abastecimentos";

-- DropTable
DROP TABLE "custos";

-- DropTable
DROP TABLE "documentos";

-- DropTable
DROP TABLE "fretes";

-- DropTable
DROP TABLE "historico_pneus";

-- DropTable
DROP TABLE "multas";

-- DropTable
DROP TABLE "pneus";

-- DropTable
DROP TABLE "rastreamentos";

-- DropTable
DROP TABLE "usuarios";

-- DropTable
DROP TABLE "veiculos";

-- DropEnum
DROP TYPE "Combustivel";

-- DropEnum
DROP TYPE "Perfil";

-- DropEnum
DROP TYPE "StatusFrete";

-- DropEnum
DROP TYPE "StatusMulta";

-- DropEnum
DROP TYPE "StatusPneu";

-- DropEnum
DROP TYPE "TipoCusto";

-- DropEnum
DROP TYPE "TipoDocumento";

-- CreateTable
CREATE TABLE "Veiculo" (
    "id" SERIAL NOT NULL,
    "placa" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER,
    "kmAtual" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Abastecimento" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "litros" DOUBLE PRECISION NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "km" INTEGER NOT NULL,
    "posto" TEXT,
    "veiculoId" INTEGER NOT NULL,

    CONSTRAINT "Abastecimento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_placa_key" ON "Veiculo"("placa");

-- AddForeignKey
ALTER TABLE "Abastecimento" ADD CONSTRAINT "Abastecimento_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "Veiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

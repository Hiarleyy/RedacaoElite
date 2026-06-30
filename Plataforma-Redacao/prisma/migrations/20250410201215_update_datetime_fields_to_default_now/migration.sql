/*
  Warnings:

  - Made the column `dataPagamento` on table `Pagamento` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dataCriacao` on table `Turma` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dataCriacao` on table `Usuario` required. This step will fail if there are existing NULL values in that column.
  - Made the column `dataAtualizacao` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Correcao" ALTER COLUMN "data" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "data" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Frequencia" ALTER COLUMN "data" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "data" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Modulo" ALTER COLUMN "dataCriacao" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "dataCriacao" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Pagamento" ALTER COLUMN "dataPagamento" SET NOT NULL,
ALTER COLUMN "dataPagamento" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "dataPagamento" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Redacao" ALTER COLUMN "data" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "data" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Turma" ALTER COLUMN "dataCriacao" SET NOT NULL,
ALTER COLUMN "dataCriacao" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "dataCriacao" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "dataCriacao" SET NOT NULL,
ALTER COLUMN "dataCriacao" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "dataCriacao" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "dataAtualizacao" SET NOT NULL,
ALTER COLUMN "dataAtualizacao" SET DATA TYPE TIMESTAMP(3);

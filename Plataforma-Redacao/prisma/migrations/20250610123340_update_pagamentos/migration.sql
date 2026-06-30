/*
  Warnings:

  - You are about to drop the column `dataVencimento` on the `Pagamento` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `Pagamento` table. All the data in the column will be lost.
  - Added the required column `status` to the `Pagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoDespensa` to the `Pagamento` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('ENTRADA', 'SAÍDA');

-- DropForeignKey
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Pagamento" DROP COLUMN "dataVencimento",
DROP COLUMN "usuarioId",
ADD COLUMN     "status" "StatusPagamento" NOT NULL,
ADD COLUMN     "tipoDespensa" VARCHAR(100) NOT NULL;

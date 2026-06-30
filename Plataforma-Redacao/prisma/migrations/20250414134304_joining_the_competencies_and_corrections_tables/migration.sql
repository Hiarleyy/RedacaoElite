/*
  Warnings:

  - You are about to drop the column `nota` on the `Correcao` table. All the data in the column will be lost.
  - You are about to drop the `Competencia` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Competencia" DROP CONSTRAINT "Competencia_correcaoId_fkey";

-- AlterTable
ALTER TABLE "Correcao" DROP COLUMN "nota",
ADD COLUMN     "competencia01" INTEGER,
ADD COLUMN     "competencia02" INTEGER,
ADD COLUMN     "competencia03" INTEGER,
ADD COLUMN     "competencia04" INTEGER,
ADD COLUMN     "competencia05" INTEGER;

-- DropTable
DROP TABLE "Competencia";

-- CreateTable
CREATE TABLE "Proposta" (
    "id" VARCHAR(36) NOT NULL,
    "tema" VARCHAR(200) NOT NULL,
    "caminho" VARCHAR(100) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposta_pkey" PRIMARY KEY ("id")
);

/*
  Warnings:

  - You are about to drop the column `observacoes` on the `Matricula` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Matricula" DROP COLUMN "observacoes",
ADD COLUMN     "condicaoMedica" TEXT,
ADD COLUMN     "deficiencia" TEXT,
ADD COLUMN     "necessidadeEducacional" TEXT;

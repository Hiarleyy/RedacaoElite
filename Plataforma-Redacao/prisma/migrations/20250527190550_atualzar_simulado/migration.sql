/*
  Warnings:

  - You are about to alter the column `titulo` on the `Simulado` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.

*/
-- AlterTable
ALTER TABLE "Simulado" ALTER COLUMN "titulo" DROP DEFAULT,
ALTER COLUMN "titulo" SET DATA TYPE VARCHAR(200);

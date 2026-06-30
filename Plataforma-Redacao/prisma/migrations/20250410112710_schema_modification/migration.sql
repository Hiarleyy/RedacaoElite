/*
  Warnings:

  - You are about to drop the column `competenciasId` on the `Correcao` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[correcaoId]` on the table `Competencia` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `correcaoId` to the `Competencia` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Frequencia` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StatusFrequencia" AS ENUM ('PRESENTE', 'FALTOU', 'JUSTIFICADO');

-- DropForeignKey
ALTER TABLE "Correcao" DROP CONSTRAINT "Correcao_competenciasId_fkey";

-- AlterTable
ALTER TABLE "Competencia" ADD COLUMN     "correcaoId" VARCHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE "Correcao" DROP COLUMN "competenciasId";

-- AlterTable
ALTER TABLE "Frequencia" DROP COLUMN "status",
ADD COLUMN     "status" "StatusFrequencia" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Competencia_correcaoId_key" ON "Competencia"("correcaoId");

-- AddForeignKey
ALTER TABLE "Competencia" ADD CONSTRAINT "Competencia_correcaoId_fkey" FOREIGN KEY ("correcaoId") REFERENCES "Correcao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

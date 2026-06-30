/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `Simulado` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Simulado" DROP CONSTRAINT "Simulado_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Simulado" DROP COLUMN "usuarioId";

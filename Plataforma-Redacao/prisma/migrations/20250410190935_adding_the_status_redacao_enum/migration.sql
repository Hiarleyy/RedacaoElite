/*
  Warnings:

  - The `status` column on the `Redacao` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StatusRedacao" AS ENUM ('PENDENTE', 'CORRIGIDA');

-- AlterTable
ALTER TABLE "Redacao" DROP COLUMN "status",
ADD COLUMN     "status" "StatusRedacao" NOT NULL DEFAULT 'PENDENTE';

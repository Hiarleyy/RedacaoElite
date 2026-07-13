/*
  Warnings:

  - The primary key for the `Proposta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `caminho` on the `Proposta` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Proposta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Proposta" DROP CONSTRAINT "Proposta_pkey",
DROP COLUMN "caminho",
DROP COLUMN "data",
ADD COLUMN     "dataFinal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataInicial" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "eixos" VARCHAR(100)[],
ALTER COLUMN "id" SET DATA TYPE CHAR(36),
ADD CONSTRAINT "Proposta_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "MaterialApoio" (
    "id" CHAR(36) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "caminho" VARCHAR(255) NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "propostaId" VARCHAR(36) NOT NULL,

    CONSTRAINT "MaterialApoio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaterialApoio" ADD CONSTRAINT "MaterialApoio_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

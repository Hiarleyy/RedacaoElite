/*
  Warnings:

  - You are about to drop the column `propostaId` on the `Redacao` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Cargo" ADD VALUE 'PEDAGOGO';

-- DropForeignKey
ALTER TABLE "Redacao" DROP CONSTRAINT "Redacao_propostaId_fkey";

-- AlterTable
ALTER TABLE "Matricula" ADD COLUMN     "observacoes" TEXT,
ALTER COLUMN "cpf" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "dataNascimento" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "genero" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "telefone" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "endereco" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "bairro" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "cidade" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "nomeResponsavel" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "vinculoResponsavel" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "telefoneResponsavel" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "dataInicio" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "comoConheceu" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Pagamento" ADD COLUMN     "dataVencimento" TIMESTAMP(3),
ADD COLUMN     "usuarioId" CHAR(36),
ALTER COLUMN "dataPagamento" DROP NOT NULL,
ALTER COLUMN "dataPagamento" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Redacao" DROP COLUMN "propostaId";

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "diaVencimentoPadrao" INTEGER,
ADD COLUMN     "valorMensalidadePadrao" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

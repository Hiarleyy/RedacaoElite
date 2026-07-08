-- AlterTable
ALTER TABLE "Redacao" ADD COLUMN     "propostaId" VARCHAR(36);

-- AddForeignKey
ALTER TABLE "Redacao" ADD CONSTRAINT "Redacao_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

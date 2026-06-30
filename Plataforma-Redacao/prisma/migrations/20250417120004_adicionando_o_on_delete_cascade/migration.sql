-- DropForeignKey
ALTER TABLE "Correcao" DROP CONSTRAINT "Correcao_redacaoId_fkey";

-- DropForeignKey
ALTER TABLE "Frequencia" DROP CONSTRAINT "Frequencia_turmaId_fkey";

-- DropForeignKey
ALTER TABLE "Frequencia" DROP CONSTRAINT "Frequencia_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Redacao" DROP CONSTRAINT "Redacao_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_moduloId_fkey";

-- AddForeignKey
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redacao" ADD CONSTRAINT "Redacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Correcao" ADD CONSTRAINT "Correcao_redacaoId_fkey" FOREIGN KEY ("redacaoId") REFERENCES "Redacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

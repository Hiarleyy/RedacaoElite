-- AlterTable: adiciona colunas que podem ter sido omitidas por cache de migrações anteriores

-- Matricula
ALTER TABLE "Matricula" ADD COLUMN IF NOT EXISTS "diaVencimento" VARCHAR(255);

-- Modulo
ALTER TABLE "Modulo" ADD COLUMN IF NOT EXISTS "pdfUrl" VARCHAR(255);

-- Video
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "descricao" TEXT;
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "duracao" VARCHAR(50);
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "nivel" VARCHAR(50);

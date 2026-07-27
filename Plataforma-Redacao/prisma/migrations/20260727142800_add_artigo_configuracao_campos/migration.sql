-- CreateTable
CREATE TABLE IF NOT EXISTS "Configuracao" (
    "chave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("chave")
);

-- AddColumn (safe - only if not exists)
ALTER TABLE "Matricula" ADD COLUMN IF NOT EXISTS "diaVencimento" VARCHAR(255);

-- AddColumn
ALTER TABLE "Modulo" ADD COLUMN IF NOT EXISTS "pdfUrl" VARCHAR(255);

-- AddColumns Video
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "descricao" TEXT;
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "duracao" VARCHAR(50);
ALTER TABLE "Video" ADD COLUMN IF NOT EXISTS "nivel" VARCHAR(50);

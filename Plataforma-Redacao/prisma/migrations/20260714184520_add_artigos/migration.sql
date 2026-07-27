-- This migration was originally applied directly in production.
-- The SQL has been reconstructed here to keep the migration history in sync.
-- Since production already has this applied, this is a no-op there.

-- CreateTable
CREATE TABLE IF NOT EXISTS "Artigo" (
    "id" CHAR(36) NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "subtitulo" VARCHAR(255),
    "conteudo" TEXT NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "imagemCapa" VARCHAR(255),
    "tempoLeitura" INTEGER,
    "destaque" VARCHAR(50) NOT NULL DEFAULT 'NENHUM',
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artigo_pkey" PRIMARY KEY ("id")
);

-- CreateEnum
CREATE TYPE "Cargo" AS ENUM ('ADMIN', 'STANDARD');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" CHAR(36) NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "tipoUsuario" "Cargo" NOT NULL DEFAULT 'STANDARD',
    "dataCriacao" DATE,
    "dataAtualizacao" DATE,
    "turmaId" VARCHAR(36),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turma" (
    "id" CHAR(36) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "dataCriacao" DATE,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Frequencia" (
    "id" CHAR(36) NOT NULL,
    "usuarioId" VARCHAR(36) NOT NULL,
    "turmaId" VARCHAR(36) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "justificativa" TEXT,
    "data" DATE NOT NULL,

    CONSTRAINT "Frequencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" CHAR(36) NOT NULL,
    "usuarioId" VARCHAR(36) NOT NULL,
    "dataVencimento" DATE NOT NULL,
    "dataPagamento" DATE,
    "valor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redacao" (
    "id" CHAR(36) NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "caminho" VARCHAR(100),
    "data" DATE NOT NULL,
    "status" VARCHAR(20),
    "usuarioId" VARCHAR(36) NOT NULL,

    CONSTRAINT "Redacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Correcao" (
    "id" CHAR(36) NOT NULL,
    "nota" DOUBLE PRECISION NOT NULL,
    "caminho" VARCHAR(100),
    "data" DATE NOT NULL,
    "feedback" TEXT,
    "competenciasId" VARCHAR(36),
    "redacaoId" VARCHAR(36) NOT NULL,

    CONSTRAINT "Correcao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competencia" (
    "id" CHAR(36) NOT NULL,
    "competencia01" INTEGER,
    "competencia02" INTEGER,
    "competencia03" INTEGER,
    "competencia04" INTEGER,
    "competencia05" INTEGER,

    CONSTRAINT "Competencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modulo" (
    "id" CHAR(36) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "playlistUrl" VARCHAR(255) NOT NULL,
    "dataCriacao" DATE NOT NULL,

    CONSTRAINT "Modulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" CHAR(36) NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "ordem" INTEGER NOT NULL,
    "moduloId" VARCHAR(36) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Correcao_redacaoId_key" ON "Correcao"("redacaoId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frequencia" ADD CONSTRAINT "Frequencia_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redacao" ADD CONSTRAINT "Redacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Correcao" ADD CONSTRAINT "Correcao_competenciasId_fkey" FOREIGN KEY ("competenciasId") REFERENCES "Competencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Correcao" ADD CONSTRAINT "Correcao_redacaoId_fkey" FOREIGN KEY ("redacaoId") REFERENCES "Redacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_moduloId_fkey" FOREIGN KEY ("moduloId") REFERENCES "Modulo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Matricula" (
    "id" CHAR(36) NOT NULL,
    "usuarioId" CHAR(36) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "dataNascimento" TIMESTAMP(3),
    "genero" VARCHAR(50),
    "telefone" VARCHAR(20) NOT NULL,
    "endereco" VARCHAR(200),
    "bairro" VARCHAR(100),
    "cidade" VARCHAR(100),
    "nomeResponsavel" VARCHAR(200),
    "vinculoResponsavel" VARCHAR(50),
    "telefoneResponsavel" VARCHAR(20),
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "comoConheceu" VARCHAR(100),
    "observacoes" TEXT,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Matricula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Matricula_usuarioId_key" ON "Matricula"("usuarioId");

-- AddForeignKey
ALTER TABLE "Matricula" ADD CONSTRAINT "Matricula_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

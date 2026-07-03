-- CreateTable
CREATE TABLE "TipoEvento" (
    "id" CHAR(36) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cor" VARCHAR(50) NOT NULL,

    CONSTRAINT "TipoEvento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarioAcademico" (
    "id" CHAR(36) NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "cor" VARCHAR(50),
    "tipoEventoId" CHAR(36),
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarioAcademico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CalendarioAcademico" ADD CONSTRAINT "CalendarioAcademico_tipoEventoId_fkey" FOREIGN KEY ("tipoEventoId") REFERENCES "TipoEvento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

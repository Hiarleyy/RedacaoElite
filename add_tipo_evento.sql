-- Cria tabela TipoEvento
CREATE TABLE "TipoEvento" (
    "id" CHAR(36) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cor" VARCHAR(50) NOT NULL,
    CONSTRAINT "TipoEvento_pkey" PRIMARY KEY ("id")
);

-- Adiciona coluna tipoEventoId em CalendarioAcademico
ALTER TABLE "CalendarioAcademico" ADD COLUMN "tipoEventoId" CHAR(36);

-- Adiciona foreign key
ALTER TABLE "CalendarioAcademico" 
    ADD CONSTRAINT "CalendarioAcademico_tipoEventoId_fkey" 
    FOREIGN KEY ("tipoEventoId") 
    REFERENCES "TipoEvento"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

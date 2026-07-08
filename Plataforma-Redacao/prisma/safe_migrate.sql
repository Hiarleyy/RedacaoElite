-- Migração segura: altera tipos de coluna preservando todos os dados existentes
-- Converte DateTime para VARCHAR(255) com CAST explícito
-- Aumenta limites de VARCHAR para 255

-- Campos que eram DateTime -> VARCHAR(255) (cast preserva dados)
ALTER TABLE "Matricula" ALTER COLUMN "dataNascimento" TYPE VARCHAR(255) USING "dataNascimento"::TEXT;
ALTER TABLE "Matricula" ALTER COLUMN "dataInicio" TYPE VARCHAR(255) USING "dataInicio"::TEXT;

-- Campos que eram VARCHAR curto -> VARCHAR(255) (sem perda, só aumenta limite)
ALTER TABLE "Matricula" ALTER COLUMN "cpf" TYPE VARCHAR(255);
ALTER TABLE "Matricula" ALTER COLUMN "genero" TYPE VARCHAR(255);
ALTER TABLE "Matricula" ALTER COLUMN "telefone" TYPE VARCHAR(255);
ALTER TABLE "Matricula" ALTER COLUMN "endereco" TYPE VARCHAR(255);
ALTER TABLE "Matricula" ALTER COLUMN "bairro" TYPE VARCHAR(255);
ALTER TABLE "Matricula" ALTER COLUMN "cidade" TYPE VARCHAR(255);
ALTER TABLE "Matricula" ALTER COLUMN "nomeResponsavel" TYPE VARCHAR(255);
ALTER TABLE "Matricula" ALTER COLUMN "vinculoResponsavel" TYPE VARCHAR(255);
ALTER TABLE "Matricula" ALTER COLUMN "telefoneResponsavel" TYPE VARCHAR(255);
ALTER TABLE "Matricula" ALTER COLUMN "comoConheceu" TYPE VARCHAR(255);

/*
  Warnings:

  - You are about to drop the column `propostaId` on the `Redacao` table. All the data in the column will be lost.

  NOTE: This migration was partially applied before. The database already has the column changes.
  Only the PEDAGOGO enum value addition is needed now.
*/

-- AlterEnum: Add PEDAGOGO only if it doesn't already exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
        WHERE pg_type.typname = 'Cargo' AND pg_enum.enumlabel = 'PEDAGOGO'
    ) THEN
        ALTER TYPE "Cargo" ADD VALUE 'PEDAGOGO';
    END IF;
END $$;

-- DropForeignKey (safe - ignore if already dropped)
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Redacao_propostaId_fkey' AND table_name = 'Redacao'
    ) THEN
        ALTER TABLE "Redacao" DROP CONSTRAINT "Redacao_propostaId_fkey";
    END IF;
END $$;

-- AlterTable Matricula: Add column only if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Matricula' AND column_name = 'observacoes') THEN
        ALTER TABLE "Matricula" ADD COLUMN "observacoes" TEXT;
    END IF;
END $$;
ALTER TABLE "Matricula"
ALTER COLUMN "cpf" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "dataNascimento" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "genero" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "telefone" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "endereco" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "bairro" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "cidade" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "nomeResponsavel" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "vinculoResponsavel" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "telefoneResponsavel" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "dataInicio" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "comoConheceu" SET DATA TYPE VARCHAR(255);

-- AlterTable Pagamento: Add columns only if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Pagamento' AND column_name = 'dataVencimento') THEN
        ALTER TABLE "Pagamento" ADD COLUMN "dataVencimento" TIMESTAMP(3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Pagamento' AND column_name = 'usuarioId') THEN
        ALTER TABLE "Pagamento" ADD COLUMN "usuarioId" CHAR(36);
    END IF;
END $$;
ALTER TABLE "Pagamento"
ALTER COLUMN "dataPagamento" DROP NOT NULL,
ALTER COLUMN "dataPagamento" DROP DEFAULT;

-- AlterTable Redacao: Drop column only if it exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Redacao' AND column_name = 'propostaId') THEN
        ALTER TABLE "Redacao" DROP COLUMN "propostaId";
    END IF;
END $$;

-- AlterTable Usuario: Add columns only if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Usuario' AND column_name = 'diaVencimentoPadrao') THEN
        ALTER TABLE "Usuario" ADD COLUMN "diaVencimentoPadrao" INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Usuario' AND column_name = 'valorMensalidadePadrao') THEN
        ALTER TABLE "Usuario" ADD COLUMN "valorMensalidadePadrao" DOUBLE PRECISION;
    END IF;
END $$;

-- AddForeignKey (safe - ignore if already exists)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Pagamento_usuarioId_fkey' AND table_name = 'Pagamento'
    ) THEN
        ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

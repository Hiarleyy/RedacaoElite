# Migração Segura — Criptografia AES-256 na Tabela de Matrículas

Este documento descreve o processo de migração realizado para adicionar **criptografia AES-256-CBC** aos dados pessoais e sensíveis da tabela `Matricula`, sem perda de dados.

---

## 1. Contexto

Os campos da tabela `Matricula` armazenavam dados pessoais em texto plano (CPF, telefone, endereço, dados do responsável, etc.). Para aumentar a segurança, foi implementada criptografia reversível (AES-256-CBC) nesses campos.

### Campos afetados

| Campo               | Tipo Anterior        | Tipo Novo         |
|---------------------|----------------------|-------------------|
| cpf                 | VARCHAR(14)          | VARCHAR(255)      |
| dataNascimento      | TIMESTAMP (DateTime) | VARCHAR(255)      |
| genero              | VARCHAR(50)          | VARCHAR(255)      |
| telefone            | VARCHAR(20)          | VARCHAR(255)      |
| endereco            | VARCHAR(200)         | VARCHAR(255)      |
| bairro              | VARCHAR(100)         | VARCHAR(255)      |
| cidade              | VARCHAR(100)         | VARCHAR(255)      |
| nomeResponsavel     | VARCHAR(200)         | VARCHAR(255)      |
| vinculoResponsavel  | VARCHAR(50)          | VARCHAR(255)      |
| telefoneResponsavel | VARCHAR(20)          | VARCHAR(255)      |
| dataInicio          | TIMESTAMP (DateTime) | VARCHAR(255)      |
| comoConheceu        | VARCHAR(100)         | VARCHAR(255)      |

> **Nota:** O campo `observacoes` (TEXT) **não é criptografado**, pois é um campo de texto livre longo.

---

## 2. Problema com o Prisma Migrate

O comando padrão `npx prisma migrate dev` falhou porque uma migração anterior (`add_calendario_academico`) havia sido modificada após ser aplicada, causando um conflito de histórico:

```
The migration `20260703130807_add_calendario_academico` was modified after it was applied.
We need to reset the "public" schema at "localhost:5433"
```

O `prisma migrate reset` **apagaria todos os dados**, o que era inaceitável. Por isso, optamos por uma **migração manual via SQL direto**.

---

## 3. Solução: Migração via SQL Direto

### 3.1. Arquivo SQL de migração segura

Foi criado o arquivo `prisma/safe_migrate.sql` com os seguintes comandos:

```sql
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
```

### 3.2. Execução no banco local

```bash
npx prisma db execute --file prisma/safe_migrate.sql --schema prisma/schema.prisma
```

### 3.3. Execução no banco do Docker

```bash
docker exec plataforma-redacao-backend npx prisma db execute --file prisma/safe_migrate.sql --schema prisma/schema.prisma
```

### 3.4. Regeneração do Prisma Client

Após a migração SQL, o Prisma Client foi regenerado para refletir os novos tipos:

```bash
npx prisma generate
```

---

## 4. Arquivos Modificados

### 4.1. `prisma/schema.prisma`

Os tipos dos campos do modelo `Matricula` foram alterados para `String @db.VarChar(255)`:

```prisma
model Matricula {
  id                   String   @id @db.Char(36)
  usuarioId            String   @unique @db.Char(36)
  cpf                  String   @db.VarChar(255)
  dataNascimento       String?  @db.VarChar(255)
  genero               String?  @db.VarChar(255)
  telefone             String   @db.VarChar(255)
  endereco             String?  @db.VarChar(255)
  bairro               String?  @db.VarChar(255)
  cidade               String?  @db.VarChar(255)
  nomeResponsavel      String?  @db.VarChar(255)
  vinculoResponsavel   String?  @db.VarChar(255)
  telefoneResponsavel  String?  @db.VarChar(255)
  dataInicio           String   @db.VarChar(255)
  comoConheceu         String?  @db.VarChar(255)
  observacoes          String?  @db.Text
  dataCriacao          DateTime @default(now())
  usuario              Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
}
```

### 4.2. `src/utils/crypto.js` (NOVO)

Utilitário de criptografia/descriptografia usando **AES-256-CBC**:

- `encrypt(text)` — Criptografa um texto e retorna no formato `iv:ciphertext` (hexadecimal).
- `decrypt(encryptedText)` — Descriptografa o texto criptografado de volta ao valor original.
- A chave de 32 bytes é derivada da variável de ambiente `JWT_SENHA` via SHA-256.
- Possui **fallback de retrocompatibilidade**: se o texto não estiver no formato `iv:hex`, retorna o valor original sem erro.

### 4.3. `src/entities/Matricula.js`

A entidade agora importa `encrypt` e criptografa todos os campos sensíveis no construtor, antes de salvar no banco.

### 4.4. `src/repositories/matriculas-repository.js`

- **Escrita** (`crieNovaMatricula`, `upsertMatriculaPorUsuarioId`): os dados são criptografados via `encryptPayload()` antes de serem enviados ao Prisma.
- **Leitura** (`retorneTodasAsMatriculas`, `retorneMatriculaPorUsuarioId`, `retorneMatriculaPorId`): os dados são descriptografados via `decryptMatricula()` antes de serem retornados.

---

## 5. Rebuild do Container Docker

Após todas as alterações no código, o container do backend foi reconstruído:

```bash
docker compose up -d --build backend
```

E a migração SQL foi executada dentro do container:

```bash
docker exec plataforma-redacao-backend npx prisma db execute --file prisma/safe_migrate.sql --schema prisma/schema.prisma
```

---

## 6. Verificação

Para confirmar que os dados estão criptografados no banco, você pode conectar diretamente ao PostgreSQL:

```bash
docker exec -it plataforma-redacao-db psql -U postgres -d BDPlataformaRedacao -c "SELECT cpf, telefone, \"dataNascimento\" FROM \"Matricula\" LIMIT 5;"
```

Os valores devem aparecer no formato criptografado: `iv_hex:ciphertext_hex` (exemplo: `a1b2c3d4e5f6...:9f8e7d6c5b4a...`).

No frontend, os dados continuam aparecendo normalmente (descriptografados) pois a API faz o `decrypt` antes de retornar.

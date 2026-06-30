# Seed - Usuário Administrador

Este arquivo explica como criar um usuário administrador no sistema usando o seed.

## Como executar

### Opção 1: Usando npm
```bash
npm run seed
```

### Opção 2: Usando Prisma (após resetar o banco)
```bash
npx prisma db seed
```

### Opção 3: Executando diretamente
```bash
node prisma/seed.js
```

## O que o seed faz

O script de seed criará um usuário administrador com as seguintes características:

- **Email**: `admin@gmail.com`
- **Nome**: `Administrador`
- **Senha**: `admin` (extraída do email antes do @gmail.com)
- **Tipo**: `ADMIN`
- **Turma**: Não vinculado a nenhuma turma

## Importante

- O seed verifica se já existe um usuário ADMIN antes de criar um novo
- Se já existir um administrador, o script não criará outro
- A senha segue a lógica do sistema: usa a parte do email antes do `@gmail.com`
- O usuário admin não precisa estar vinculado a uma turma

## Credenciais para login

Após executar o seed, você pode fazer login com:
- **Email**: `admin@gmail.com`
- **Senha**: `admin`

## Exemplo de uso com outras credenciais

Se quiser criar um admin com credenciais diferentes, edite o arquivo `prisma/seed.js` e altere:

```javascript
const emailAdmin = 'seuemail@gmail.com'  // A senha será 'seuemail'
const nomeAdmin = 'Seu Nome'
```

## Troubleshooting

Se houver erro, certifique-se de que:
1. O banco de dados está rodando
2. As migrações do Prisma foram executadas: `npx prisma migrate dev`
3. O Prisma Client foi gerado: `npx prisma generate`

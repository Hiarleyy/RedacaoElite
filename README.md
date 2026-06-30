# Redacao Elite

Monorepo da Plataforma de Redacao Elite, com backend Node.js/Express, frontend React/Vite e orquestracao local via Docker Compose.

## Visao Geral

O projeto esta organizado em duas aplicacoes principais:

- `Plataforma-Redacao/`: API backend responsavel por autenticacao, usuarios, turmas, redacoes, correcoes, simulados, pagamentos, videos e uploads.
- `Plataforma-Redacao-front/`: interface web em React/Vite consumindo a API.
- `docker-compose.yml`: ambiente integrado com proxy, banco PostgreSQL, backend e frontend.

## Arquitetura

```txt
RedacaoElite/
  Plataforma-Redacao/          # Backend Node.js + Express + Prisma
    prisma/                    # Schema, migrations e seed
    src/
      controllers/             # Camada HTTP
      middlewares/             # Auth, admin, uploads e tratamento de erro
      models/                  # Regras de negocio
      repositories/            # Acesso a dados
      schemas/                 # Validacoes Zod
      uploads/                 # Arquivos enviados em runtime
      routes.js                # Rotas da API
      server.js                # Inicializacao HTTP/HTTPS
  Plataforma-Redacao-front/    # Frontend React + Vite
    public/                    # Arquivos publicos
    src/
      components/              # Componentes reutilizaveis
      pages/                   # Telas por perfil/area
      utils/                   # Clientes e utilitarios
    Dockerfile
    package.json
  docker-compose.yml           # Stack local
```

## Stack

Backend:

- Node.js 20
- Express 5
- Prisma ORM
- PostgreSQL
- JWT
- Zod
- Multer e Sharp para uploads/imagens

Frontend:

- React 19
- Vite 6
- React Router
- Axios
- Chart.js, Recharts e bibliotecas auxiliares de UI/dados

Infra local:

- Docker Compose
- PostgreSQL
- Traefik como proxy/reverse proxy
- Nginx para servir o build do frontend

## Executando Com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

Servicos expostos no ambiente local:

- Frontend: `http://localhost`
- API via proxy: `http://localhost/api`
- Uploads via proxy: `http://localhost/uploads`
- Dashboard Traefik: `http://localhost:8080`
- PostgreSQL: porta local `5433`

O backend executa migrations Prisma e seed durante a subida do container.

## Executando Localmente

Backend:

```bash
cd Plataforma-Redacao
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

Frontend:

```bash
cd Plataforma-Redacao-front
npm install
npm run dev
```

Por padrao, o Vite abre o frontend em `http://localhost:5173`.

## Scripts Principais

Backend (`Plataforma-Redacao`):

- `npm run dev`: inicia a API em modo watch.
- `npm run seed`: executa o seed Prisma.

Frontend (`Plataforma-Redacao-front`):

- `npm run dev`: inicia o Vite em desenvolvimento.
- `npm run build`: gera o build de producao.
- `npm run lint`: executa o ESLint.
- `npm run preview`: serve o build localmente.

## Rotas E Dominios Da API

A API possui rotas para:

- Autenticacao e usuarios
- Turmas
- Pagamentos
- Modulos e videos
- Redacoes e correcoes
- Propostas
- Frequencias
- Ranking
- Simulados e notas de simulados

Rota rapida de saude:

```txt
GET /teste
```

Quando executado pelo Docker Compose, o Traefik publica a API com prefixo `/api` e encaminha para o backend.

## Banco De Dados

O Prisma usa PostgreSQL e o schema principal esta em:

```txt
Plataforma-Redacao/prisma/schema.prisma
```

Entidades principais:

- `Usuario`
- `Turma`
- `Frequencia`
- `Pagamento`
- `Redacao`
- `Correcao`
- `Proposta`
- `Modulo`
- `Video`
- `Simulado`
- `NotasSimulado`

As migrations ficam em:

```txt
Plataforma-Redacao/prisma/migrations/
```

## Uploads E Arquivos Gerados

Arquivos enviados pela aplicacao ficam em diretórios de upload no backend, como `src/uploads/`. Esses arquivos sao dados de runtime e nao devem ser versionados.

Tambem nao devem ser enviados para o Git:

- `.env`
- `node_modules/`
- `dist/`
- arquivos de build/cache
- uploads reais de usuarios
- chaves privadas, certificados sensiveis e dumps de banco

## Seguranca

- Nunca commit arquivos `.env` reais.
- Troque segredos antes de publicar ou fazer deploy.
- Use secrets do ambiente de deploy para `DATABASE_URL`, `JWT_SENHA` e credenciais do banco.
- Se algum segredo real ja tiver sido publicado no historico Git, considere-o comprometido e gere novos valores.

## Validacao

Comandos uteis antes de abrir PR ou publicar alteracoes:

```bash
cd Plataforma-Redacao-front
npm run build
```

```bash
cd Plataforma-Redacao
npx prisma validate
```

const express = require("express")
const cors = require("cors")
const http = require("http")
require('dotenv').config();
const routes = require("./routes")
const path = require("path");
const errorMiddleware = require("./middlewares/error-middleware")

const app = express()

app.use(cors({
  origin: [
    "https://redacaoelite.com",
    "https://www.redacaoelite.com",
    "https://redacao.redacaoelite.online",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:3000",
    "https://localhost:3001",
    "http://localhost",
    "http://api.localhost"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", routes);
app.use(errorMiddleware);

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const start = () => {
  // Em produção, o Traefik faz a terminação TLS (HTTPS).
  // O backend só precisa rodar HTTP simples.
  const httpServer = http.createServer(app).listen(HTTP_PORT, HOST, () => {
    console.log(`Servidor HTTP rodando em: http://${HOST}:${HTTP_PORT}`)
  })

  httpServer.on("error", (error) => console.error(`Erro ao iniciar o servidor: ${error.message}`))
}

start()
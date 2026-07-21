const express = require("express")
const cors = require("cors")
const https = require("https")
const http = require("http")
const fs = require("fs")
require('dotenv').config();
const routes = require("./routes")
const path = require("path");
const errorMiddleware = require("./middlewares/error-middleware")

const app = express()

app.use(cors({
  origin: [
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
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", routes);
app.use(errorMiddleware);

const HTTPS_PORT = process.env.HTTPS_PORT 
const HTTP_PORT = process.env.HTTP_PORT 
const HOST = process.env.HOST 
const PORT = process.env.PORT || 3001; // porta padrão HTTPS


//Função para verificar se os certificados SSL existem
const checkSSLCertificates = () => {
  try {
    const certPath = '/etc/letsencrypt/live/api.redacaoelite.online/fullchain.pem';
    const keyPath = '/etc/letsencrypt/live/api.redacaoelite.online/privkey.pem';
    
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      return {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
      };
    }
    return null;
  } catch (error) {
    console.warn(`Erro ao carregar certificados SSL: ${error.message}`);
    return null;
  }
};

const start = () => {
  const sslOptions = checkSSLCertificates();

  if (sslOptions) {
    console.log('Certificados SSL encontrados. Iniciando servidor HTTPS...');
    
    // Servidor HTTP que redireciona para HTTPS
    const httpApp = express();
    httpApp.use((req, res) => {
      const httpsUrl = `https://${req.headers.host}${req.url}`;
      res.redirect(301, httpsUrl);
    });

    // Servidor HTTPS principal
    const httpsServer = https.createServer(sslOptions, app).listen(PORT, () => {
      console.log(`Servidor HTTPS rodando em: https://${HOST}:${PORT}`)
    })

    const httpServer = http.createServer(httpApp).listen(HTTP_PORT, () => {
      console.log(`Servidor HTTP rodando em: http://${HOST}:${HTTP_PORT} (redirecionando para HTTPS)`)
    })

    httpsServer.on("error", (error) => console.error(`Erro ao iniciar o servidor HTTPS: ${error.message}`))
    httpServer.on("error", (error) => console.error(`Erro ao iniciar o servidor HTTP: ${error.message}`))
  } else {
    console.log('Certificados SSL não encontrados. Iniciando servidor HTTP...');
    
    // Servidor HTTP sem SSL
    const httpServer = http.createServer(app).listen(HTTP_PORT || PORT, () => {
      const serverPort = HTTP_PORT || PORT;
      console.log(`Servidor HTTP rodando em: http://${HOST}:${serverPort}`)
    })

    httpServer.on("error", (error) => console.error(`Erro ao iniciar o servidor HTTP: ${error.message}`))
  }
}

start()
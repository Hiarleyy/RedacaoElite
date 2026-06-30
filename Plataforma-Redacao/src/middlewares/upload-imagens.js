const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define o diretório de destino para as imagens de perfil
const dir = path.join(__dirname, "..", "uploads", "profile");

// Garante que o diretório existe, criando-o se necessário
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Configura o armazenamento do Multer
const storage = multer.diskStorage({
  // Define o diretório de destino
  destination: (req, file, cb) => {
    cb(null, dir);
  },
  
  // Define o nome do arquivo
  filename: (req, file, cb) => {
    // Obtém a extensão do arquivo original
    const ext = path.extname(file.originalname);
    
    // Cria um nome único com o ID do usuário (se disponível nas rotas) ou timestamp
    const userId = req.params.id || '';
    const uniqueName = `user-${userId}${ext}`;
    
    cb(null, uniqueName);
  }
});

// Filtra tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
  // Lista de tipos MIME permitidos para imagens
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não suportado. Apenas JPEG, PNG, GIF e WebP são permitidos."), false);
  }
};

// Limites para upload
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB máximo
};

// Cria e exporta o middleware do Multer
const upload = multer({ 
  storage, 
  fileFilter,
  limits
});

module.exports = upload;
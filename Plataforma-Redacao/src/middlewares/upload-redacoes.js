const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { retornarUmUsuario } = require("../models/usuarios-model")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const usuarioId = req.params.usuarioId

    retornarUmUsuario(usuarioId).then(() => {
      const dir = path.join(__dirname, "..", "uploads", "redacoes", usuarioId)

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      cb(null, dir)
    }).catch(error => {
      console.error("Erro ao verificar usuário ou criar diretório:", error)
      cb(error, null)
    })
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const uniqueName = `${file.fieldname}-${Date.now()}${ext}`
    cb(null, uniqueName)
  },
})

const upload = multer({ storage })

module.exports = upload


const fs = require("fs")
const path = require("path")

const deletarArquivo = (caminhos) => {
  const caminhoArquivo = path.join(__dirname, "..", ...caminhos)

  if (!fs.existsSync(caminhoArquivo)) {
    console.warn("Arquivo não encontrado:", caminhoArquivo)
    return
  }

  const stats = fs.statSync(caminhoArquivo)

  if (stats.isFile()) {
    return fs.unlinkSync(caminhoArquivo)
  }

  if (stats.isDirectory()) {
    return fs.rmdirSync(caminhoArquivo, { recursive: true }) 
  }
}

module.exports = deletarArquivo

const redacoesModel = require("../models/redacoes-model")
const path = require("path")
const fs = require("fs")

const redacoesController = {
  // GET /redacoes
  index: async (req, res, next) => {
    try {
      const { usuarioId, corrigidas, pendentes } = req.query
      const corrigidasBool = corrigidas === "true"
      const pendentesBool = pendentes === "true"
      let resposta

      // Buscando as redações corrigidas de um usuário específico
      if (usuarioId && corrigidasBool) {
        resposta = await redacoesModel.retornarRedacoes(usuarioId, corrigidasBool)
        return res.status(200).json({ data: resposta.redacoes });
      }

      // Buscando as redações pendentes de um usuário específico
      if (usuarioId && pendentesBool) {
        resposta = await redacoesModel.retornarRedacoes(usuarioId, false, pendentesBool)
        return res.status(200).json({ data: resposta.redacoes });
      }

      // Buscando todas as redações corrigidas
      if (corrigidasBool) {
        resposta = await redacoesModel.retornarRedacoes(false, corrigidasBool)
        return res.status(200).json({ data: resposta.redacoes });
      }

      // Buscando todas as redações pendentes
      if (pendentes) {
        resposta = await redacoesModel.retornarRedacoes(false, false, pendentesBool)
        return res.status(200).json({ data: resposta.redacoes });
      }

      // Buscando as redações de um usuário específico
      if (usuarioId) {
        resposta = await redacoesModel.retornarRedacoes(usuarioId)
        return res.status(200).json({ data: resposta.redacoes });
      }

      // Buscando todas as redações
      resposta = await redacoesModel.retornarRedacoes()
      res.status(200).json({ data: resposta.redacoes });
    } catch (error) {
      next(error)
    }
  },

  // GET /redacoes/:id
  show: async (req, res, next) => {
    try {
      const { id } = req.params
      const resposta = await redacoesModel.retornarRedacao(id)
      res.status(200).json({ data: resposta })
    } catch (error) {
      next(error)
    }
  },

  // POST /redacoes/:usuarioId/upload
  create: async (req, res, next) => {
    try {
      const { titulo, usuarioId } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "Arquivo não enviado." });
      }

      const resposta = await redacoesModel.criarRedacao({
        titulo,
        caminho: req.file.filename,
        usuarioId,
      });

      res.status(201).json({ message: "Redação salva com sucesso!", data: resposta });
    } catch (error) {
      next(error)
    }
  },

  // GET /redacoes/download/:id
  download: async (req, res, next) => {
    try {
      const { id } = req.params
      const redacao = await redacoesModel.retornarRedacao(id)

      const filePath = path.join(__dirname, "..", "uploads", "redacoes", redacao.usuarioId, redacao.caminho)

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Arquivo não encontrado." })
      }

      res.download(filePath, `${redacao.titulo}.pdf`, (err) => {
        if (err) {
          res.status(500).json({ message: "Erro ao fazer download do arquivo." })
        }
      })
    } catch (error) {
      next(error)
    }
  },
  
  // DELETE /redacoes/:id
  delete: async (req, res, next) => {
    try {
      const { id } = req.params
      const resposta = await redacoesModel.deletarRedacao(id)
      res.status(200).json({ message: "Redação deletada com sucesso.", data: resposta })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = redacoesController

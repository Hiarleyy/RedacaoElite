const modulosModel = require("../models/modulos-model")

const modulosController = {
  // GET /modulos
  index: async (req, res, next) => {
    try {
      const resposta = await modulosModel.retornarModulos()
      res.status(200).json({ data: resposta });
    } catch (erro) {
      next(erro);
    }
  },

  // GET /modulos/:id
  show: async (req, res, next) => {
    try {
      const { id } = req.params
      const resposta = await modulosModel.retornarUmModulo(id)
      res.status(200).json({ data: resposta })
    } catch (error) {
      next(error)
    }
  },

  // POST /modulos
  create: async (req, res, next) => {
    try {
      const corpoDaRequisicao = req.body
      console.log("CREATE MODULO req.body.pdfInfo:", req.body.pdfInfo)
      console.log("CREATE MODULO req.files:", req.files)
      const resposta = await modulosModel.criarModulo(corpoDaRequisicao, req.files)
      res.status(200).json({ message: "modulo criado com sucesso.", data: resposta })
    } catch (error) {
      next(error)
    }
  },
  
  delete: async (req, res, next) => {
    try {
      const { id } = req.params
      const resposta = await modulosModel.deletarModulo(id)
      res.status(200).json({ message: "Modulo deletado com sucesso.", data: resposta })
    } catch (error) {
      next(error)
    }
  }, 
  
  update: async (req, res, next) => {
    try {
      const { id } = req.params
      const corpoDaRequisicao = req.body
      console.log("UPDATE MODULO req.body.pdfInfo:", req.body.pdfInfo)
      console.log("UPDATE MODULO req.files:", req.files)
      const resposta = await modulosModel.atualizarModulo(id, corpoDaRequisicao, req.files)
      res.status(200).json({ message: "Modulo atualizado com sucesso.", data: resposta })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = modulosController
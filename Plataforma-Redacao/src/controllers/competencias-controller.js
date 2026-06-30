const competenciasModel = require("../models/competenciasModel")

const competenciasController = {
  // GET /usuarios
  index: async (req, res, next) => {
    try {
      const resposta = await competenciasModel.retornarCompetencias()
      res.status(200).json({ data: resposta })
    } catch (error) {
      next(error)
    }
  },

  // GET /usuarios/:id
  show: async (req, res, next) => {
    try {
      const { id } = req.params
      const resposta = await competenciasModel.retornarCompetenciasPorId(id)
      res.status(200).json({ data: resposta })
    } catch (error) {
      next(error)
    }
  },

  // POST /usuarios
  create: async (req, res, next) => {
    try {
      const corpoDaRequisicao = req.body
      const resposta = await competenciasModel.criarNovasCompetencias(corpoDaRequisicao)
      res.status(200).json({ message: "competencias criadas com sucesso", data: resposta })
    } catch (error) {
      next(error)
    }
  },
  // DELETE /usuarios/:id
  delete: async (req, res, next) => {
    try {
      const { id } = req.params
      const resposta = await competenciasModel.deleteUmaCompetencia(id)
      res.status(200).json({ message: "competencia deletada com sucesso", data: resposta })
    } catch (error) {
      next(error)
    }
  }
}


module.exports = competenciasController
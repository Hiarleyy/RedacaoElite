const matriculasModel = require("../models/matriculas-model")

const matriculasController = {
  // POST /matriculas
  create: async (req, res, next) => {
    try {
      const corpo = req.body
      const matricula = await matriculasModel.criarMatricula(corpo)
      res.status(201).json({
        message: "Matrícula realizada com sucesso.",
        data: matricula
      })
    } catch (error) {
      next(error)
    }
  },

  // GET /matriculas
  index: async (req, res, next) => {
    try {
      const matriculas = await matriculasModel.retornarMatriculas()
      res.status(200).json({ data: matriculas })
    } catch (error) {
      next(error)
    }
  },

  // GET /matriculas/:id
  show: async (req, res, next) => {
    try {
      const { id } = req.params
      const matricula = await matriculasModel.retornarMatriculaPorId(id)
      res.status(200).json({ data: matricula })
    } catch (error) {
      next(error)
    }
  },

  // GET /matriculas/usuario/:usuarioId
  showByUsuario: async (req, res, next) => {
    try {
      const { usuarioId } = req.params
      const matricula = await matriculasModel.retornarMatriculaPorUsuarioId(usuarioId)
      res.status(200).json({ data: matricula })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = matriculasController

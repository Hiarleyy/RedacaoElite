const turmaModel = require("../models/turmas-model")

const turmaController = {
  // GET /turmas
  index: async (req, res, next) => {
    try {
      const resposta = await turmaModel.retornarTurmas()
      res.status(200).json({ data: resposta })
    } catch (error) {
      next(error)
    }
  },

  // GET /turmas/:id
  show: async (req, res, next) => {
    try {
      const { id } = req.params
      const resposta = await turmaModel.retornarTurma(id)
      res.status(200).json({ data: resposta })
    } catch (error) {
      next(error)
    }
  },

  // POST /turmas
  create: async (req, res, next) => {
    try {
      const corpoDaRequisicao = req.body
      const resposta = await turmaModel.criarTurma(corpoDaRequisicao)
      res.status(200).json({ message: "turma criada com sucesso.", data: resposta })
    } catch (error) {
      next(error)
    }
  },

  // PUT /turmas/:id
  update: async (req, res, next) =>{
    try{
      const {id} = req.params
      const corpoDaRequisicao = req.body
      const resposta = await turmaModel.atualizarTurma(id, corpoDaRequisicao)
      res.status(200).json({ message: "turma atualizada com sucesso.", data: resposta })
    } catch(error){
      next (error)
    }
  },

  // DELETE /turmas/:id
  delete: async (req, res, next) =>{
    try{
      const {id} = req.params
      const resposta = await turmaModel.deletarTurma(id)
      res.status(200).json({ message: "turma deletada com sucesso.", data: resposta })
    } catch(error){
      next (error)
    }
  }
}

module.exports = turmaController
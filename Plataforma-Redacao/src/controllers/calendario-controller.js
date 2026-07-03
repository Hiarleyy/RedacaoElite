const calendarioModel = require("../models/calendario-model");

const calendarioController = {
  // GET /calendario
  index: async (req, res, next) => {
    try {
      const resposta = await calendarioModel.retornarEventos();
      res.status(200).json({ data: resposta });
    } catch (error) {
      next(error);
    }
  },

  // GET /calendario/:id
  show: async (req, res, next) => {
    try {
      const { id } = req.params;
      const resposta = await calendarioModel.retornarEvento(id);
      res.status(200).json({ data: resposta });
    } catch (error) {
      next(error);
    }
  },

  // POST /calendario
  create: async (req, res, next) => {
    try {
      const corpoDaRequisicao = req.body;
      const resposta = await calendarioModel.criarEvento(corpoDaRequisicao);
      res.status(200).json({ message: "Evento criado com sucesso.", data: resposta });
    } catch (error) {
      next(error);
    }
  },

  // PUT /calendario/:id
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const corpoDaRequisicao = req.body;
      const resposta = await calendarioModel.atualizarEvento(id, corpoDaRequisicao);
      res.status(200).json({ message: "Evento atualizado com sucesso.", data: resposta });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /calendario/:id
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const resposta = await calendarioModel.deletarEvento(id);
      res.status(200).json({ message: "Evento deletado com sucesso.", data: resposta });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = calendarioController;

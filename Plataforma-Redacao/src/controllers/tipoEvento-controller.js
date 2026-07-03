const tipoEventoModel = require("../models/tipoEvento-model");

const tipoEventoController = {
  index: async (req, res) => {
    try {
      const tipos = await tipoEventoModel.retornarTodos();
      res.status(200).json({ data: tipos });
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  show: async (req, res) => {
    try {
      const { id } = req.params;
      const tipo = await tipoEventoModel.retornarUm(id);
      res.status(200).json({ data: tipo });
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const tipo = await tipoEventoModel.criar(req.body);
      res.status(201).json({ data: tipo });
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const tipo = await tipoEventoModel.atualizar(id, req.body);
      res.status(200).json({ data: tipo });
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      await tipoEventoModel.deletar(id);
      res.status(204).send();
    } catch (error) {
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = tipoEventoController;

const artigosModel = require("../models/artigos-model");
const path = require("path");

const artigosController = {
  // GET /artigos
  index: async (req, res, next) => {
    try {
      const resposta = await artigosModel.retornarArtigos();
      res.status(200).json({ data: resposta });
    } catch (error) {
      next(error);
    }
  },

  // GET /artigos/:id
  show: async (req, res, next) => {
    try {
      const { id } = req.params;
      const resposta = await artigosModel.retornarArtigo(id);
      res.status(200).json({ data: resposta });
    } catch (error) {
      next(error);
    }
  },

  // POST /artigos
  create: async (req, res, next) => {
    try {
      const corpoDaRequisicao = req.body;
      const filename = req.file?.filename;
      const resposta = await artigosModel.criarArtigo(corpoDaRequisicao, filename);
      res.status(201).json({ message: "Artigo criado com sucesso.", data: resposta });
    } catch (error) {
      next(error);
    }
  },

  // PUT /artigos/:id
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const corpoDaRequisicao = req.body;
      const filename = req.file?.filename;
      const resposta = await artigosModel.atualizarArtigo(id, corpoDaRequisicao, filename);
      res.status(200).json({ message: "Artigo atualizado com sucesso.", data: resposta });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /artigos/:id
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const resposta = await artigosModel.deletarArtigo(id);
      res.status(200).json({ message: "Artigo deletado com sucesso.", data: resposta });
    } catch (error) {
      next(error);
    }
  },

  // GET /artigos/:id/capa
  getCapaImage: async (req, res, next) => {
    try {
      const { id } = req.params;
      const artigo = await artigosModel.retornarArtigo(id);
      
      if (!artigo.imagemCapa) {
        return res.status(404).json({ error: "Artigo não possui imagem de capa" });
      }

      const filePath = path.join(__dirname, "..", "uploads", "artigos", artigo.imagemCapa);
      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = artigosController;

const propostasRepository = require("../repositories/propostas-repository");
const { criarPropostaSchema } = require("../schemas/propostas-schema");
const HttpError = require("../error/http-error");
const propostasModel = require("../models/propostas-model");
const fs = require("fs")
const path = require('path');

const propostasController = {
  index: async (req, res, next) => {
    try {
      resposta = await propostasModel.retornarPropostas()
      res.status(200).json({ data: resposta.propostas });
    } catch (error) {
      next(error)
    }
  },

  show: async (req, res, next) => {
    try {
      const corpoDaRequisicao = req.params;
      const resposta = await propostasModel.retornarUmaProposta(corpoDaRequisicao.id);
      res.status(200).json({ message: "proposta encontrada com sucesso!", data: resposta });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const { tema } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "Arquivo não enviado." });
      }
      const resposta = await propostasModel.criarProposta({
        tema,
        caminho: req.file.filename,
      });
      console.log("resposta")
      res.status(201).json({ message: "proposta salva com sucesso!", data: resposta });
    } catch (error) {
      next(error)
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const proposta = await propostasModel.retornarUmaProposta(id);
      if (!proposta) throw new HttpError(404, "Proposta não encontrada");

      const filePath = path.join(__dirname, "..", "uploads", "propostas", proposta.caminho);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await propostasRepository.deletarUmaProposta(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  download: async (req, res, next) => {
    try{
      const proposta = await propostasModel.retornarPropostaMaisNova()
      if(!proposta) throw new HttpError(404, "Proposta não encontrada")
      const filePath = path.join(__dirname, "..", "uploads", "propostas", proposta.caminho)
          
      if(!fs.existsSync(filePath)){
        return res.status(404).json({ message: "Arquivo não encontrado." })
      }

      res.download(filePath,`${proposta.tema}.pdf`, (err) => {
        console.log("Caminho do arquivo:", filePath)

        if(err){
          res.status(500).json({ message: "Erro ao fazer download do arquivo." })
        }
      })
    } catch(error) {
      next(error)
    }
  }
};

module.exports = propostasController;

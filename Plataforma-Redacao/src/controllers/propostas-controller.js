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
      const { tema, dataInicial, dataFinal } = req.body;
      let { eixos, materiaisInfo } = req.body;

      if (typeof eixos === 'string') eixos = JSON.parse(eixos);
      if (typeof materiaisInfo === 'string') materiaisInfo = JSON.parse(materiaisInfo);

      const files = req.files || [];
      const materiais = (materiaisInfo || []).map(info => {
        const material = { tipo: info.tipo, nome: info.titulo, caminho: info.caminho || '' };
        if (info.tipo === 'pdf' || info.tipo === 'imagem') {
          const file = files.find(f => f.originalname === info.caminho);
          if (file) {
            material.caminho = file.filename;
          }
        }
        return material;
      });

      const proposta = await propostasModel.criarProposta({
        tema,
        dataInicial: new Date(dataInicial),
        dataFinal: new Date(dataFinal),
        eixos,
        MaterialApoio: materiais,
      });
      res.status(201).json({ message: "proposta criada com sucesso!", data: proposta });
    } catch (error) {
      console.log(error);
      next(error)
    } 
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { tema, dataInicial, dataFinal } = req.body;
      let { eixos, materiaisInfo } = req.body;

      if (typeof eixos === 'string') eixos = JSON.parse(eixos);
      if (typeof materiaisInfo === 'string') materiaisInfo = JSON.parse(materiaisInfo);

      const files = req.files || [];
      const materiais = (materiaisInfo || []).map(info => {
        const material = { tipo: info.tipo, nome: info.titulo, caminho: info.caminho || '' };
        if (info.tipo === 'pdf' || info.tipo === 'imagem') {
          const file = files.find(f => f.originalname === info.caminho);
          if (file) {
            material.caminho = file.filename;
          }
        }
        return material;
      });

      const proposta = await propostasModel.atualizarProposta(id, {
        tema,
        dataInicial: new Date(dataInicial),
        dataFinal: new Date(dataFinal),
        eixos,
        MaterialApoio: materiais,
      });
      res.status(200).json({ message: "proposta atualizada com sucesso!", data: proposta });
    } catch (error) {
      console.log(error);
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

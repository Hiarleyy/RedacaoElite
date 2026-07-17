const configuracaoModel = require("../models/configuracoes-model")

const configuracaoController = {
  obterConfiguracao: async (req, res) => {
    try {
      const { chave } = req.params
      const config = await configuracaoModel.obterConfiguracao(chave)
      
      if (!config) {
        return res.status(200).json(null)
      }
      
      res.status(200).json(config)
    } catch (error) {
      console.error("Erro ao obter configuração:", error)
      res.status(500).json({ error: "Erro interno do servidor." })
    }
  },

  salvarConfiguracao: async (req, res) => {
    try {
      const { chave } = req.params
      const valorEmJSON = req.body

      if (!chave || !valorEmJSON) {
        return res.status(400).json({ error: "Chave e valor são obrigatórios." })
      }

      const configAtualizada = await configuracaoModel.salvarConfiguracao(chave, valorEmJSON)
      res.status(200).json(configAtualizada)
    } catch (error) {
      console.error("Erro ao salvar configuração:", error)
      res.status(500).json({ error: "Erro interno do servidor." })
    }
  }
}

module.exports = configuracaoController

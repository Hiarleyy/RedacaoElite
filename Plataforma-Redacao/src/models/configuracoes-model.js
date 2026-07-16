const configuracaoRepository = require("../repositories/configuracoes-repository")

const configuracaoModel = {
  obterConfiguracao: async (chave) => {
    const config = await configuracaoRepository.retorneConfiguracaoPorChave(chave)
    if (!config) {
      return null // Retorna null se não houver configuração, permitindo ao frontend tratar isso
    }
    return JSON.parse(config.valor)
  },

  salvarConfiguracao: async (chave, valorEmJSON) => {
    const stringValor = JSON.stringify(valorEmJSON)
    const configSalva = await configuracaoRepository.salvarConfiguracao(chave, stringValor)
    return JSON.parse(configSalva.valor)
  }
}

module.exports = configuracaoModel

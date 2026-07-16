const prisma = require("../database/db")

const configuracaoRepository = {
  // Retorna uma configuração pela chave
  retorneConfiguracaoPorChave: async (chave) => {
    const configuracao = await prisma.configuracao.findUnique({
      where: { chave }
    })
    return configuracao
  },

  // Insere ou atualiza uma configuração
  salvarConfiguracao: async (chave, valor) => {
    const configuracaoSalva = await prisma.configuracao.upsert({
      where: { chave },
      update: { valor },
      create: { chave, valor }
    })
    return configuracaoSalva
  }
}

module.exports = configuracaoRepository

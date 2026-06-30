const prisma = require("../database/db")
const Redacao = require("../entities/Redacao")

const redacoesRepository = {
  // Retorna todas as redações do banco de dados
  retorneTodasAsRedacoes: async (usuarioId = false) => {
    let redacoes
    let quantidadeRedacoes
    const includeBody = { usuario: true }

    // Retorna todas as redações
    if (!usuarioId) {
      redacoes = await prisma.redacao.findMany({ include: includeBody })
      quantidadeRedacoes = await prisma.redacao.count()
      return { redacoes, quantidadeRedacoes }
    }

    // Retorna todas as redações de um usuário específico
    redacoes = await prisma.redacao.findMany({
      where: { usuarioId },
      include: includeBody 
    });

    quantidadeRedacoes = await prisma.redacao.count({ 
      where: { usuarioId }
    })
  
    return { redacoes, quantidadeRedacoes }
  },

  // Retorna as redações corrigidas
  retornarRedacoesCorrigidas: async (usuarioId = false) => {
    let redacoes
    let quantidadeRedacoes
    const includeBody = { correcao: true, usuario: true }

    if (!usuarioId) {
      redacoes = await prisma.redacao.findMany({ 
        where: { status: "CORRIGIDA" },
        include: includeBody
      })

      quantidadeRedacoes = await prisma.redacao.count({
        where: { status: "CORRIGIDA" }
      })

      return { redacoes, quantidadeRedacoes }
    }

    redacoes = await prisma.redacao.findMany({ 
      where: { usuarioId, status: "CORRIGIDA" },
      include: includeBody
    })

    quantidadeRedacoes = await prisma.redacao.count({
      where: { usuarioId, status: "CORRIGIDA" }
    })

    return { redacoes, quantidadeRedacoes }
  },

  // Retornar redações não corrigidas
  retornarRedacoesPendentes: async (usuarioId = false) => {
    let redacoes
    let quantidadeRedacoes
    const includeBody = { usuario: true }

    if (!usuarioId) {
      redacoes = await prisma.redacao.findMany({ 
        where: { status: "PENDENTE" },
        include: includeBody
      })

      quantidadeRedacoes = await prisma.redacao.count({
        where: { status: "PENDENTE" }
      })

      return { redacoes, quantidadeRedacoes }
    }

    redacoes = await prisma.redacao.findMany({ 
      where: { usuarioId, status: "PENDENTE" },
      include: includeBody
    })

    quantidadeRedacoes = await prisma.redacao.count({
      where: { usuarioId, status: "PENDENTE" }
    })

    return { redacoes, quantidadeRedacoes }
  },

  // Retorna uma redação específica
  retornaUmaRedacao: async (id) => {
    const redacao = await prisma.redacao.findUnique({ where: { id }, include: { usuario: true, correcao: true } })
    return redacao
  },

  // Retorna a redação mais antiga de um usário
  retorneRedacaoMaisAntiga: async (usuarioId, corrigidas = false) => {
    if (corrigidas) {
      const redacao = await prisma.redacao.findFirst({ 
        where: { usuarioId, status: "CORRIGIDA" }, 
        orderBy: { data: "asc" }, 
        include: { correcao: true } 
      })

      return redacao
    }
    
    return await prisma.redacao.findFirst({ where: { usuarioId }, orderBy: { data: "asc" } })
  },

  // Mudar status de uma redação para CORRIGIDA
  marcarRedacaoComoCorrigida: async (id) => {
    const redacaoCorrigida = await prisma.redacao.update({ 
      data: { status: "CORRIGIDA" }, where: { id } 
    })
    
    return redacaoCorrigida
  },
    
  // Cria uma nova redação
  crieNovaRedacao: async (data) => {
    const redacao = new Redacao(data)
    const novaRedacao = await prisma.redacao.create({data: redacao})
    return novaRedacao;
  },

  // Deleatar uma redação
  deletarUmaRedacao: async (id) => {
    const redacaoDeletada = await prisma.redacao.delete({ 
      where: { id }, select: { id: true, titulo: true } 
    })

    return redacaoDeletada
  }
}

module.exports = redacoesRepository

const prisma = require("../database/db")
const Proposta = require("../entities/Proposta")

const propostasRepository = {
  // Retorna todas as propostas
  retorneTodasAsPropostas: async () => {
    const propostas = await prisma.proposta.findMany();
    const quantidadedePropostas = await prisma.proposta.count()
    return { propostas, quantidadedePropostas };
  },

  // Retorna a redação mais antiga de um usário
  retornePropostaMaisAntiga: async () => {
    const proposta = await prisma.proposta.findFirst({orderBy: { data: "asc" }})  
    return proposta
    },

    retornePropostaMaisNova: async () => {
    const proposta = await prisma.proposta.findFirst({
      orderBy: { data: "desc" }
    })  
    return proposta
    },

  // Retorna uma proposta específica
  retorneUmaPropostaPeloId: async (id) =>{
    const proposta = await prisma.proposta.findUnique({where: { id }})
    return proposta
  },

  // Cria uma nova proposta
  crieNovaProposta: async (data) => {
    const proposta = new Proposta(data);
    const novaProposta = await prisma.proposta.create({data: proposta})
    return novaProposta;
  },

  // Deleta uma proposta
  deletarUmaProposta: async (id) => {
    const propostaDeletada = await prisma.proposta.delete({ 
      where: { id }, select: { id: true, tema: true } 
    })

    return propostaDeletada
  }
}

module.exports = propostasRepository

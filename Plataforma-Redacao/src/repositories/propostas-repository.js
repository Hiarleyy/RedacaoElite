const prisma = require("../database/db")
const Proposta = require("../entities/Proposta")

const propostasRepository = {
  // Retorna todas as propostas
  retorneTodasAsPropostas: async () => {
    const propostas = await prisma.proposta.findMany({
      include: { materiais: true }
    });
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
    const proposta = await prisma.proposta.findUnique({
      where: { id },
      include: { materiais: true }
    })
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
  },

  atualizeUmaProposta: async (id, data) => {
    const updateData = {
      tema: data.tema,
      dataInicial: data.dataInicial,
      dataFinal: data.dataFinal,
      eixos: data.eixos
    };

    if (data.MaterialApoio) {
      updateData.materiais = {
        deleteMany: {},
        create: data.MaterialApoio.map(m => ({
          id: require("uuid").v4(),
          tipo: m.tipo,
          caminho: m.caminho,
          nome: m.nome
        }))
      };
    }

    const proposta = await prisma.proposta.update({where: { id }, data: updateData})
    return proposta
  }
}

module.exports = propostasRepository

const prisma = require("../database/db")
const Turma = require("../entities/turma")

const turmaRepository = {
  // Retorna todas as turmas do bando de dados
  retorneTodasAsTurmas: async () => {
    const turmas = await prisma.turma.findMany({
      select: {
        id: true,
        nome: true,
        dataCriacao: true,
      },
      orderBy: { nome: 'asc' }
    })

    return turmas
  },

  retorneUmaTurmaPeloId: async (id) => {
    const turma = await prisma.turma.findUnique({
      where: { id },
      include: {
        usuarios: true
      }
    });
  
    return turma;
  },

  // Retorna uma turma específica pelo nome
  retorneUmaTurmaPeloNome: async (nome) => {
    const turma = await prisma.turma.findUnique({
      where: { nome },
      select: {
        id: true,
        nome: true,
        dataCriacao: true,
      }
    })

    return turma
  },

  // Crie uma nova turma
  crieNovaTurma: async (data) => {
    const turma = new Turma(data)

    const novaTurma = await prisma.turma.create({
      data: turma,
      select: {
        id: true,
        nome: true,
        dataCriacao: true,
      },
    })

    return novaTurma
  },

  // Atualiza uma turma
  atualizarUmaTurma: async (id, data) =>{
    const turmaAtualizada = await prisma.turma.update({
      data,
      where: { id }
    })

    return turmaAtualizada
  },

  // Deleta uma turma
  deletarUmaTurma: async (id) =>{
    const turmaDeletada = await prisma.turma.delete({
      where: { id }
    })

    return turmaDeletada
  }
}

module.exports = turmaRepository
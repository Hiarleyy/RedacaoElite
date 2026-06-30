const prisma = require("../database/db")
const Modulo = require("../entities/Modulo")

const modulosRepository = {
  // Retorna todos os modulos do banco de dados
  retorneTodosOsModulos: async () => {
    const modulos = await prisma.modulo.findMany({
      select: {
        id: true,
        nome: true,
        descricao: true,
        playlistUrl: true,
        dataCriacao: true,
        videos: true
      },
      orderBy: { nome: 'asc' }
    })

    return modulos
  },

  // Retorna um modulo específico pelo id
  retorneUmModuloPeloId: async (id) => {
    const modulo = await prisma.modulo.findUnique({ 
      where: { id }, 
      select: { 
        id: true,
        nome: true, 
        descricao: true,
        playlistUrl: true,
        dataCriacao: true,
        videos: true 
      } 
    })

    return modulo
  },

  // Crie um novo modulo
  crieNovoModulo: async (data) => {
    const modulo = new Modulo(data)
    const novoModulo = await prisma.modulo.create({ data: modulo })
    return novoModulo
  },

  // Delete um modulo
  deleteUmModulo: async (id) => {
    const moduloDeletado = await prisma.modulo.delete(
      { where: { id }}
    )

    return moduloDeletado
  },

  atualizeUmModulo: async (id, data) => {
    const moduloAtualizado = await prisma.modulo.update(
      { where: { id }, data }
    )

    return moduloAtualizado
  }
}

module.exports = modulosRepository
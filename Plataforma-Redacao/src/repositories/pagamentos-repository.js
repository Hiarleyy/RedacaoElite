const prisma = require("../database/db")
const Pagamento = require("../entities/Pagamento")

const pagamentosRepository = {
  // Retorna todos os pagamentos do bando de dados
  retorneTodosOsPagamentos: async () => {
    const pagamentos = await prisma.pagamento.findMany()
    return pagamentos
  },

  // Retorna um pagamento pelo id
  retorneUmPagamentoPeloId: async (id) => {
    const pagamento = await prisma.pagamento.findUnique({where:{id}})
    return pagamento
  },

  // Crie um novo pagamento
  crieNovoPagamento: async (data) => {
    const pagamento = new Pagamento(data)
    const novoPagamento = await prisma.pagamento.create({data: pagamento});
    return novoPagamento
  },

  updateUmPagamento: async (id, data ) => {
    const updatePagamento = await prisma.pagamento.update({
      data,
      where:{ id }
    })
    return updatePagamento
  },

  deleteUmPagamento: async (id) => {
    const deletePagamento = await prisma.pagamento.delete({
      where: { id }
    }) 

    return deletePagamento
  },
  retorneTodosOsPagamentosUsuario: async (id) => {
    const pagamentos = await prisma.pagamento.findMany({
      where: {usuarioId: id}
    })
    return pagamentos
  }
}

module.exports = pagamentosRepository
const pagamentosRepository = require("../repositories/pagamentos-repository")
const usuariosRepository = require("../repositories/usuarios-repository")
const {criarPagamentoSchema, atualizarPagamentoSchema, deletarPagamentoSchema}  = require("../schemas/pagamentos-schema")
const HttpError = require("../error/http-error")

const pagamentosModel = {
  retornarPagamentos: async() =>{
    const pagamentos = await pagamentosRepository.retorneTodosOsPagamentos()
    return pagamentos
  },

  criarPagamento: async (data) => {
    const corpo = criarPagamentoSchema.safeParse(data)
    if (!corpo.success){
      console.log("Erro de validação:", corpo.error.errors);
      throw new HttpError(400, "Erro de validação: Verifique se os dados enviados estão corretos.");
    }

    const Novopagamento = await pagamentosRepository.crieNovoPagamento(corpo.data)
    return Novopagamento

  },

  atualizarPagamento: async(id, data) => {
    const corpo = atualizarPagamentoSchema.safeParse(data)
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: Verifique se os dados enviados estão corretos.");
    } 
    // verificar pagamento se pagamento existe
    const pagamentoExistente = await pagamentosRepository.retorneUmPagamentoPeloId(id)
    if(!pagamentoExistente) throw new HttpError(404, "Esse pagamento nao existe.")
    
    const updatePagamento = await pagamentosRepository.updateUmPagamento(id, corpo.data)

    return updatePagamento
  },
  
  deletarPagamentos: async(id) => {
    const deletePagamento = await pagamentosRepository.deleteUmPagamento(id)
    return deletePagamento
  },
  retornarPagamentosUsuario: async(id) =>{
    const pagamentoExistente = pagamentosRepository.retorneUmPagamentoPeloId(id)
    if (!pagamentoExistente) {
      throw new HttpError (404, "Esse usuário não tem nenhum pagamento feito!")
    }

    const pagamento = await pagamentosRepository.retorneTodosOsPagamentosUsuario(id)
    return pagamento

  }
}

module.exports = pagamentosModel

const pagamentosModel = require("../models/pagamentos-model");
const { show } = require("./usuarios-controller");

const pagamentosController = {
  // GET /pagamentos 
  index: async (req, res, next) => {
    try {
      const resposta = await pagamentosModel.retornarPagamentos()
      res.status(200).json({ data: resposta })
    } catch (erro) {
      next(erro);
    }
  }, 

  // POST /pagamentos
  create: async (req, res, next) => {
    try {
      const corpoDaRequisicao = req.body
      console.log(corpoDaRequisicao)
      const novoPagamento = await pagamentosModel.criarPagamento(corpoDaRequisicao)
      return res.status(200).json({ message: "novo pagamento efetuado com sucesso.", data: novoPagamento})
    } 
    catch(error){
      console.log(error)
      next(error)
    }
  },

  update: async(req, res, next) => {
    try {
      const { id } = req.params
      const corpoDaRequisicao = req.body
      const resposta = await pagamentosModel.atualizarPagamento(id, corpoDaRequisicao)
      res.status(200).json({ message: "Pagamento atualizado com sucesso.", data: resposta })
    } catch(error){
      next(error)
    }
  },

  delete: async(req, res, next) => {
    try{
      const {id} = req.params

      const resposta = await pagamentosModel.deletarPagamentos(id)
      res.status(200).json({message: "usuário deletado com sucesso.", data: resposta})
    }catch(error){
      next(error)
    }
  },
  show: async (req, res, next) =>{
    try {
      const {id} = req.params

      const resposta = await pagamentosModel.retornarPagamentosUsuario(id)
      res.status(200).json({data: resposta})
    }
    catch(error){
      next(error)
    }
  }
}

module.exports = pagamentosController
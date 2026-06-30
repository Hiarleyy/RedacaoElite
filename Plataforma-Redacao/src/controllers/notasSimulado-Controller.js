
const notasSimuladoModel = require('../models/notasSimulado-model')

const notasSimuladoController = {
    create: async (req, res, next) => {
        try {
            const corpoDaRequisicao = req.body
            const resposta = await notasSimuladoModel.criarNotasSImulado(corpoDaRequisicao)
            res.status(200).json({ message: "Notas criadas com sucesso.", data: resposta })
        } catch (error) {
            next(error)
        }
    },
    index: async (req, res, next) => {
        try {
            const resposta = await notasSimuladoModel.retornarNotasSimulado()
            res.status(200).json({ data: resposta })
        } catch (error) {
            next(error)
        }
    },
    show: async (req, res, next) => {
        try {
            const { id } = req.params
            const resposta = await notasSimuladoModel.retornarNotasSimuladoPorId(id)
            res.status(200).json({ data: resposta })
        } catch (error) {
            next(error)
        }
    }, 
    delete: async (req, res, next) => {
        try {
            const { id } = req.params
            const resposta = await notasSimuladoModel.deletarNotasSimulado(id)
            res.status(200).json({ message: "Notas deletadas com sucesso.", data: resposta })
        } catch (error) {
            next(error)
        }
    },
    showBySimulado: async(req, res, next) => {
        try{
           const { id } = req.params

            const resposta = await notasSimuladoModel.retornarNotasSimuladoPorSimulado(id)
            res.status(200).json({ data: resposta })
        }
        catch(error){
           next(error)
        }
    }


}

module.exports = notasSimuladoController


const simuladoModel = require("../models/simulado-model")


const simuladoController = {
    create: async (req, res, next) => {
        try {
            const corpoDaRequisicao = req.body
            const resposta = await simuladoModel.criarSimulado(corpoDaRequisicao)
            res.status(200).json({ message: "Simulado criado com sucesso.", data: resposta })
        } catch (error) {
            next(error)
        }
    },
    index: async (req, res, next) => {
        try {
            const resposta = await simuladoModel.retornarSimulados()
            res.status(200).json({ data: resposta })
        } catch (error) {
            next(error)
        }
    },
    show: async (req, res, next) => {
        try {
            const { id } = req.params
            const resposta = await simuladoModel.retornarSimulado(id)
            res.status(200).json({ data: resposta })
        } catch (error) {
            next(error)
        }
    },
    showByTurma: async(req, res, next) => {
        try{
            const {id} = req.params
            const resposta = await simuladoModel.retornarSimuladoTurma(id)
            res.status(200).json({data: resposta})

        } catch(error){
            next(error)
        }
    },





    delete: async (req, res, next) => {
        try {
            const { id } = req.params
            const resposta = await simuladoModel.deletarSimulado(id)
            res.status(200).json({ message: "Simulado deletado com sucesso.", data: resposta })
        } catch (error) {
            next(error)
        }
    }
    
}

module.exports = simuladoController

const NotasSimulado = require("../entities/NotasSimulado")
const prisma = require("../database/db")

const notasSimuladoRepository = {
    crieNovaNotasSimulado : async(data) =>{
        const notasSimulado = new NotasSimulado(data)

        const novoNotasSimulado = await prisma.notasSimulado.create({data: notasSimulado})
        return novoNotasSimulado

    }, 
    retornarTodasNotasSimulados: async() =>{
        const notasSimulado = await prisma.notasSimulado.findMany()
        return notasSimulado
    },
    retornarUmNotasSimulado: async(id) => {
        const notasSimulado = await prisma.notasSimulado.findUnique({where: {id}})
        return notasSimulado
    },
    atualizarNotasSimulado: async(id, data) => {
        const notasSimulado = await prisma.notasSimulado.update({where: {id}, data})
        return notasSimulado
    },
    deletarNotasSimulado: async(id) => {
        const notasSimulado = await prisma.notasSimulado.delete({where: {id}})
        return notasSimulado
    },
    retornarNotasSimuladoPorSimulado: async(id) => {
        const notasSimulado = await prisma.notasSimulado.findMany({where: {simuladoId: id}})
        return notasSimulado
    }


}

module.exports = notasSimuladoRepository
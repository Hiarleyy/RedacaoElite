
const prisma = require('../database/db')
const Frquencia = require("../entities/Frequencia")


const frequenciasRepository= {

    crieNovaFrequencia: async(data)=>{
        const frequencia = new Frquencia(data)
        const novaFrequencia = await prisma.frequencia.create({data: frequencia})
        return novaFrequencia
    },
    retornarUmaFrequenciaPeloId: async (id) => {
        const frequencia = await prisma.frequencia.findUnique({where: { id}})
        return frequencia
    },
    retorneTodasAsFrequencias: async() =>{
        const todasAsFrequencias = await prisma.frequencia.findMany()
        return todasAsFrequencias
    },

    updateFrequencia: async(id, data) =>{
        const updateFrequencia = await prisma.frequencia.update({
            data, 
            where: {id}
        })
    return updateFrequencia
    },

    deletarUmaFrequencia: async(id) => {
        const frequenciaDeletada = await prisma.frequencia.delete({
            where: {id}
        })
    return frequenciaDeletada
    },
    retornarUmaFrequenciaPeloIdAluno: async(id) =>{
        const frquenciaAluno = await prisma.frequencia.findMany({
            where: {usuarioId: id}
        })
        return frquenciaAluno
    }


}

module.exports = frequenciasRepository


const HttpError = require("../error/http-error")
const usuarioRepository = require("../repositories/usuarios-repository")

const simuladoRepository = require("../repositories/simulado-repository");
const { criarNotasSimuladoSchema } = require("../schemas/notasSimulado-schema")
const notasSimuladoRepository = require("../repositories/notasSimulado-repository")

const notasSimuladoModel = {
    criarNotasSImulado: async(data) =>{
        const corpo = criarNotasSimuladoSchema.safeParse(data)

        if (!corpo.success) { 
        throw new HttpError(400,"Erro de validação: Verifique se os dados enviados está corretos.");
        }
        const simuladoExiste = await simuladoRepository.retornarUmSimulado(corpo.data.simuladoId)
        if (!simuladoExiste) throw new HttpError(404, "Essa turma nao existe.")
        
        const usuarioExiste = await usuarioRepository.retorneUmUsuarioPeloId(corpo.data.usuarioId)
        if (!usuarioExiste) throw new HttpError( 404, "Erro de validação: Verifique se os dados enviados está corretos.")

        return await notasSimuladoRepository.crieNovaNotasSimulado(corpo.data)

    },
    retornarNotasSimulado: async () => {
        return await notasSimuladoRepository.retornarTodasNotasSimulados()
    },
    retornarNotasSimuladoPorId: async (id) => {

        const notasSimuladoExiste = await notasSimuladoRepository.retornarUmNotasSimulado(id)
        if (!notasSimuladoExiste) throw new HttpError(404, "Essa notas nao existe.")

            
        return  notasSimuladoExiste
    },
    deletarNotasSimulado: async (id) => {
        const notasSimuladoExiste = await notasSimuladoRepository.retornarUmNotasSimulado(id)
        if (!notasSimuladoExiste) throw new HttpError(404, "Essa notas do simulado  nao existe.")
        return await notasSimuladoRepository.deletarNotasSimulado(id)
    },
    retornarNotasSimuladoPorSimulado: async (id) => {
        const simuladoExiste = await simuladoRepository.retornarUmSimulado(id)
        if (!simuladoExiste) throw new HttpError(404, "Esse simulado nao existe.")

        return await notasSimuladoRepository.retornarNotasSimuladoPorSimulado(id)
    }

}

module.exports = notasSimuladoModel
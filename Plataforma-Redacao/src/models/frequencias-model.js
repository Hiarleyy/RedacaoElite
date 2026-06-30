const frequenciasRepository = require("../repositories/frequencias-repository")
const {criarFrequenciaSchema, atualizarFrequenciaSchema } = require("../schemas/frequencias-schema")
const HttpError = require("../error/http-error")
const usuariosRepository = require("../repositories/usuarios-repository")
const turmaRepository = require("../repositories/turmas-repository")


const frequenciasModel = {

    criarFrequencia: async (data) => {
        const corpo = criarFrequenciaSchema.safeParse(data)
        if (!corpo.success) {
            throw new HttpError(400, "Erro de validação: Verifique se os dados enviados está corretos.")
        }

        // Verificando se o aluno existe
        const alunoExiste = await usuariosRepository.retorneUmUsuarioPeloId(corpo.data.usuarioId)
        if (!alunoExiste) throw new HttpError(404, "Esse aluno nao existe.")
        
        // Verificando se a turma existe
        const turmaExiste = await turmaRepository.retorneUmaTurmaPeloId(corpo.data.turmaId)
        if (!turmaExiste) throw new HttpError(404, "Essa turma nao existe.")

        return await frequenciasRepository.crieNovaFrequencia(corpo.data)
    }, 
    retornarFrequencia: async (id) =>{
        const frequencia = await frequenciasRepository.retornarUmaFrequenciaPeloId(id)
        if (!frequencia){
            throw new HttpError(404, "Frequência não encontrada")
        }
        return frequencia
    },
    retornarFrequencias: async (usuarioId = false) => {
        return await frequenciasRepository.retorneTodasAsFrequencias()
    },
    atualizarFrequencia: async(id, data) =>{
        const corpo = atualizarFrequenciaSchema.safeParse(data)
        if (!corpo.success) {
            throw new HttpError(400, "Erro de validação: Verifique se os dados enviados está corretos.")
        }
        // verificar se a frequencia existe
        const frequenciaExistente = await frequenciasRepository.retornarUmaFrequenciaPeloId(id)
        if(!frequenciaExistente) throw new HttpError (404, "Essa frequência não existe!")
        
        const updateFrequencia = await frequenciasRepository.updateFrequencia(id, corpo.data)
        return updateFrequencia
        
    },
    deletarFrequencia: async (id) => {

        const frequenciaExistente = await frequenciasRepository.retornarUmaFrequenciaPeloId(id)
        if(!frequenciaExistente) throw new HttpError (404, "Essa frequência nao existe!")
        
        const frequenciaDeletada = await frequenciasRepository.deletarUmaFrequencia(id)
    return frequenciaDeletada
    },
    retornarFrequenciaAluno: async (id) => {
        const frequenciasAluno = await frequenciasRepository.retornarUmaFrequenciaPeloIdAluno(id)
        
        return frequenciasAluno
    }
}

module.exports = frequenciasModel
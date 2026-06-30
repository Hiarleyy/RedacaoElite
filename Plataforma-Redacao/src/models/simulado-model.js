const HttpError = require("../error/http-error")
const {criarSimuladoSchema}  = require("../schemas/simulado-schema")
const turmaRepository = require("../repositories/turmas-repository")
const simuladoRepository = require("../repositories/simulado-repository")


const simuladoModel = {
  criarSimulado: async (data) => {
    const corpo = criarSimuladoSchema.safeParse(data);

    if (!corpo.success) { 
        throw new HttpError(400,"Erro de validação: Verifique se os dados enviados está corretos.");
    }
    
    // Verificando se a turma existe
    const turmaExiste = await turmaRepository.retorneUmaTurmaPeloId(corpo.data.turmaId)
    if (!turmaExiste) throw new HttpError(404, "Essa turma nao existe.")


    return await simuladoRepository.crieNovoSimulado(corpo.data)
  },

  retornarSimulados: async () => {
    return await simuladoRepository.retornarTodosSimulados()
  },

  retornarSimulado: async (id) => {
    const simuladoExiste = await simuladoRepository.retornarUmSimulado(id)
    if (!simuladoExiste) throw new HttpError(404, "Esse simulado nao existe.")


    return simuladoExiste
  },
  retornarSimuladoTurma: async(id) =>{
    const simuladosTurma = await simuladoRepository.retornarSimuladoTurma(id)
    if (!simuladosTurma) throw new HttpError(404, "Essa turma não possui simulado criado, por favor crie um simulado.")

    return simuladosTurma
    
  },
  deletarSimulado: async (id) => {
    const simuladoExiste = await simuladoRepository.retornarUmSimulado(id)
    if (!simuladoExiste) throw new HttpError(404, "Esse simulado nao existe.")

    return await simuladoRepository.deletarUmSimulado(id)
  },
};

module.exports = simuladoModel;

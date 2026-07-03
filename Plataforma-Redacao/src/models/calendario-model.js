const calendarioRepository = require("../repositories/calendario-repository");
const HttpError = require("../error/http-error");
const { criarEventoSchema, atualizarEventoSchema } = require("../schemas/calendario-schema");

const calendarioModel = {
  retornarEventos: async () => {
    return await calendarioRepository.retorneTodosOsEventos();
  },

  retornarEvento: async (id) => {
    const evento = await calendarioRepository.retorneUmEventoPeloId(id);
    if (!evento) throw new HttpError(404, "Esse evento não existe.");
    return evento;
  },

  criarEvento: async (data) => {
    const corpo = criarEventoSchema.safeParse(data);
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: Verifique os dados enviados.");
    }
    return await calendarioRepository.crieNovoEvento(data);
  },

  atualizarEvento: async (id, data) => {
    const corpo = atualizarEventoSchema.safeParse(data);
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: Verifique os dados enviados.");
    }
    // Verificar se existe
    await calendarioModel.retornarEvento(id);
    return await calendarioRepository.atualizarUmEvento(id, corpo.data);
  },

  deletarEvento: async (id) => {
    // Verificar se existe
    await calendarioModel.retornarEvento(id);
    return await calendarioRepository.deletarUmEvento(id);
  }
};

module.exports = calendarioModel;

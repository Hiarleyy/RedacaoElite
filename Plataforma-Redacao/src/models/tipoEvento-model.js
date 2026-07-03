const tipoEventoRepository = require("../repositories/tipoEvento-repository");
const HttpError = require("../error/http-error");
const { criarTipoEventoSchema, atualizarTipoEventoSchema } = require("../schemas/tipoEvento-schema");

const tipoEventoModel = {
  retornarTodos: async () => {
    return await tipoEventoRepository.retorneTodos();
  },

  retornarUm: async (id) => {
    const tipo = await tipoEventoRepository.retorneUmPeloId(id);
    if (!tipo) throw new HttpError(404, "Tipo de evento não encontrado.");
    return tipo;
  },

  criar: async (data) => {
    const corpo = criarTipoEventoSchema.safeParse(data);
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: verifique nome e cor.");
    }
    return await tipoEventoRepository.crieNovo(data);
  },

  atualizar: async (id, data) => {
    const corpo = atualizarTipoEventoSchema.safeParse(data);
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: verifique nome e cor.");
    }
    await tipoEventoModel.retornarUm(id);
    return await tipoEventoRepository.atualize(id, corpo.data);
  },

  deletar: async (id) => {
    await tipoEventoModel.retornarUm(id);
    return await tipoEventoRepository.delete(id);
  },
};

module.exports = tipoEventoModel;

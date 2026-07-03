const prisma = require("../database/db");
const TipoEvento = require("../entities/TipoEvento");

const tipoEventoRepository = {
  retorneTodos: async () => {
    return await prisma.tipoEvento.findMany({
      orderBy: { nome: "asc" },
    });
  },

  retorneUmPeloId: async (id) => {
    return await prisma.tipoEvento.findUnique({
      where: { id },
      include: { eventos: true },
    });
  },

  crieNovo: async (data) => {
    const tipo = new TipoEvento(data);
    return await prisma.tipoEvento.create({ data: tipo });
  },

  atualize: async (id, data) => {
    const dataUpdate = {};
    if (data.nome !== undefined) dataUpdate.nome = data.nome;
    if (data.cor !== undefined) dataUpdate.cor = data.cor;
    return await prisma.tipoEvento.update({ where: { id }, data: dataUpdate });
  },

  delete: async (id) => {
    // Desvincula eventos antes de deletar
    await prisma.calendarioAcademico.updateMany({
      where: { tipoEventoId: id },
      data: { tipoEventoId: null },
    });
    return await prisma.tipoEvento.delete({ where: { id } });
  },
};

module.exports = tipoEventoRepository;

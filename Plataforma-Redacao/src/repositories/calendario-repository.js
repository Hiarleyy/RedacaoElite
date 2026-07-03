const prisma = require("../database/db");
const CalendarioAcademico = require("../entities/CalendarioAcademico");

const calendarioRepository = {
  retorneTodosOsEventos: async () => {
    const eventos = await prisma.calendarioAcademico.findMany({
      orderBy: { dataInicio: 'asc' },
      include: { tipoEvento: true },
    });
    return eventos;
  },

  retorneUmEventoPeloId: async (id) => {
    const evento = await prisma.calendarioAcademico.findUnique({
      where: { id },
      include: { tipoEvento: true },
    });
    return evento;
  },

  crieNovoEvento: async (data) => {
    const evento = new CalendarioAcademico(data);
    const novoEvento = await prisma.calendarioAcademico.create({
      data: evento,
      include: { tipoEvento: true },
    });
    return novoEvento;
  },

  atualizarUmEvento: async (id, data) => {
    const dataUpdate = {};
    if (data.titulo !== undefined) dataUpdate.titulo = data.titulo;
    if (data.descricao !== undefined) dataUpdate.descricao = data.descricao;
    if (data.dataInicio !== undefined) dataUpdate.dataInicio = new Date(data.dataInicio);
    if (data.dataFim !== undefined) dataUpdate.dataFim = new Date(data.dataFim);
    if (data.cor !== undefined) dataUpdate.cor = data.cor;
    if (data.tipoEventoId !== undefined) dataUpdate.tipoEventoId = data.tipoEventoId;

    const eventoAtualizado = await prisma.calendarioAcademico.update({
      where: { id },
      data: dataUpdate,
      include: { tipoEvento: true },
    });
    return eventoAtualizado;
  },

  deletarUmEvento: async (id) => {
    const eventoDeletado = await prisma.calendarioAcademico.delete({
      where: { id }
    });
    return eventoDeletado;
  }
};

module.exports = calendarioRepository;

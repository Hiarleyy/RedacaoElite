const Simulado = require("../entities/Simulado");
const prisma = require("../database/db");

const simuladoRepository = {
  crieNovoSimulado: async (data) => {
    const simulado = new Simulado(data);
    const novoSimulado = await prisma.simulado.create({ data: simulado });
    return novoSimulado;
  },
  retornarTodosSimulados: async () => {
    const Todossimulados = await prisma.simulado.findMany({
      include: {
        turma: {
          select: { nome: true },
        },
      },
    });
    return Todossimulados;
  },
  retornarUmSimulado: async (id) => {
    const simulado = await prisma.simulado.findMany({ where: { id: id } });
    return simulado;
  },

  retornarSimuladoTurma: async (id) => {
    const simulado = await prisma.simulado.findMany({ where: { turmaId: id } });
    return simulado;
  },

  deletarUmSimulado: async (id) => {
    const simulado = await prisma.simulado.delete({ where: { id: id } });
    return simulado;
  },
};

module.exports = simuladoRepository;

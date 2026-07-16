const prisma = require("../database/db");
const crypto = require("crypto");

const artigosRepository = {
  retorneTodosOsArtigos: async () => {
    const artigos = await prisma.artigo.findMany({
      orderBy: { criadoEm: 'desc' },
    });
    return artigos;
  },

  retorneUmArtigoPeloId: async (id) => {
    const artigo = await prisma.artigo.findUnique({
      where: { id },
    });
    return artigo;
  },

  crieNovoArtigo: async (data) => {
    const novoArtigo = await prisma.artigo.create({
      data: {
        id: crypto.randomUUID(),
        ...data
      },
    });
    return novoArtigo;
  },

  atualizarUmArtigo: async (id, data) => {
    const artigoAtualizado = await prisma.artigo.update({
      where: { id },
      data,
    });
    return artigoAtualizado;
  },

  deletarUmArtigo: async (id) => {
    const artigoDeletado = await prisma.artigo.delete({
      where: { id }
    });
    return artigoDeletado;
  },

  contarDestaquesSemana: async (excludeId = null) => {
    const where = { destaque: 'DESTAQUE_SEMANA' };
    if (excludeId) where.id = { not: excludeId };
    return await prisma.artigo.count({ where });
  },

  contarDestaquesRapidos: async (excludeId = null) => {
    const where = { destaque: 'DESTAQUE_RAPIDO' };
    if (excludeId) where.id = { not: excludeId };
    return await prisma.artigo.count({ where });
  }
};

module.exports = artigosRepository;

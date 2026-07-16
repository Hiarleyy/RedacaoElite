const artigosRepository = require("../repositories/artigos-repository");
const HttpError = require("../error/http-error");
const { criarArtigoSchema, atualizarArtigoSchema } = require("../schemas/artigos-schema");

const artigosModel = {
  retornarArtigos: async () => {
    return await artigosRepository.retorneTodosOsArtigos();
  },

  retornarArtigo: async (id) => {
    const artigo = await artigosRepository.retorneUmArtigoPeloId(id);
    if (!artigo) throw new HttpError(404, "Esse artigo não existe.");
    return artigo;
  },

  validarLimitesDestaque: async (destaque, excludeId = null) => {
    if (destaque === "DESTAQUE_SEMANA") {
      const count = await artigosRepository.contarDestaquesSemana(excludeId);
      if (count >= 1) {
        throw new HttpError(400, "Já existe um artigo definido como Destaque da Semana. Remova o destaque atual antes de definir outro.");
      }
    } else if (destaque === "DESTAQUE_RAPIDO") {
      const count = await artigosRepository.contarDestaquesRapidos(excludeId);
      if (count >= 3) {
        throw new HttpError(400, "O limite máximo de 3 Destaques Rápidos foi atingido. Remova um antes de adicionar outro.");
      }
    }
  },

  criarArtigo: async (data, filename) => {
    const corpo = criarArtigoSchema.safeParse(data);
    if (!corpo.success) {
      console.error("Zod Validation Error:", JSON.stringify(corpo.error.format(), null, 2));
      const firstError = Object.values(corpo.error.format())[1]?._errors?.[0] || "Erro desconhecido";
      throw new HttpError(400, `Erro de validação: ${firstError}`);
    }
    
    if (corpo.data.destaque && corpo.data.destaque !== "NENHUM") {
      await artigosModel.validarLimitesDestaque(corpo.data.destaque);
    }

    const payload = { ...corpo.data };
    if (filename) {
      payload.imagemCapa = filename;
    }

    return await artigosRepository.crieNovoArtigo(payload);
  },

  atualizarArtigo: async (id, data, filename) => {
    const corpo = atualizarArtigoSchema.safeParse(data);
    if (!corpo.success) {
      console.error("Zod Validation Error:", JSON.stringify(corpo.error.format(), null, 2));
      const firstError = Object.values(corpo.error.format())[1]?._errors?.[0] || "Erro desconhecido";
      throw new HttpError(400, `Erro de validação: ${firstError}`);
    }

    await artigosModel.retornarArtigo(id);

    if (corpo.data.destaque && corpo.data.destaque !== "NENHUM") {
      await artigosModel.validarLimitesDestaque(corpo.data.destaque, id);
    }

    const payload = { ...corpo.data };
    if (filename) {
      payload.imagemCapa = filename;
    }

    return await artigosRepository.atualizarUmArtigo(id, payload);
  },

  deletarArtigo: async (id) => {
    await artigosModel.retornarArtigo(id);
    return await artigosRepository.deletarUmArtigo(id);
  }
};

module.exports = artigosModel;

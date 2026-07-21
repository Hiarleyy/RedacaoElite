const modulosRepository = require("../repositories/modulos-repository")
const videosRepository = require("../repositories/videos-repository")
const getPlaylistVideos = require("../utils/get-playlist-videos")
const HttpError = require("../error/http-error")
const { criarModuloSchema } = require("../schemas/modulos-schema")

const modulosModel = {
  retornarModulos: async () => {
    const modulos = await modulosRepository.retorneTodosOsModulos()
    return modulos
  },

  retornarUmModulo: async (id) => {
    const modulo = await modulosRepository.retorneUmModuloPeloId(id)
    if (!modulo) throw new HttpError(404, "esse modulo não existe.")
    return modulo
  },

  criarModulo: async (data, files) => {
    const corpo = criarModuloSchema.safeParse(data)
    
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: Verifique se os dados enviados estão corretos.")
    } 

    let pdfUrl = null;
    if (data.pdfInfo) {
      const pdfInfo = JSON.parse(data.pdfInfo);
      if (pdfInfo.arquivo && files && files.length > 0) {
        const file = files[0];
        if (file) {
          pdfUrl = `/uploads/modulos/${file.filename}`;
        }
      } else if (pdfInfo.link) {
        pdfUrl = pdfInfo.link;
      }
    }

    const modulo = await modulosRepository.crieNovoModulo({
      nome: data.nome,
      descricao: data.descricao,
      playlistUrl: data.playlistUrl,
      pdfUrl: pdfUrl
    })

    try {
      const videos = await getPlaylistVideos(data.playlistUrl)
      for (let i = 0; i < videos.length; i++) {
        await videosRepository.crieNovoVideo({
          titulo: videos[i].titulo,
          url: videos[i].url,
          ordem: videos[i].ordem,
          thumbnail: videos[i].thumbnail,
          moduloId: modulo.id
        })
      }
    } catch (e) {
      console.error("Erro ao carregar vídeos da playlist:", e.message);
    }

    return modulo
  }, 

  deletarModulo: async (id) => {
    await modulosModel.retornarUmModulo(id)
    const moduloDeletado = await modulosRepository.deleteUmModulo(id)
    return moduloDeletado
  },

  atualizarModulo: async (id, data, files) => {
    const existingModulo = await modulosModel.retornarUmModulo(id)

    let pdfUrl = null;
    if (data.pdfInfo) {
      const pdfInfo = JSON.parse(data.pdfInfo);
      if (pdfInfo.isExisting) {
        pdfUrl = pdfInfo.nomeDisplay;
      } else if (pdfInfo.arquivo && files && files.length > 0) {
        const file = files[0];
        if (file) {
          pdfUrl = `/uploads/modulos/${file.filename}`;
        }
      } else if (pdfInfo.link) {
        pdfUrl = pdfInfo.link;
      }
    }

    const moduloAtualizado = await modulosRepository.atualizeUmModulo(id, {
      nome: data.nome,
      descricao: data.descricao,
      playlistUrl: data.playlistUrl,
      pdfUrl: pdfUrl
    })

    const shouldReimport = !existingModulo.videos || existingModulo.videos.length === 0 || existingModulo.playlistUrl !== data.playlistUrl;

    if (shouldReimport && data.playlistUrl) {
      try {
        await videosRepository.deletarVideosDoModulo(id)
        const videos = await getPlaylistVideos(data.playlistUrl)
        for (let i = 0; i < videos.length; i++) {
          await videosRepository.crieNovoVideo({
            titulo: videos[i].titulo,
            url: videos[i].url,
            ordem: videos[i].ordem,
            thumbnail: videos[i].thumbnail,
            moduloId: id
          })
        }
      } catch (e) {
        console.error("Erro ao recarregar vídeos da playlist:", e.message);
      }
    }

    return moduloAtualizado
  }
}

module.exports = modulosModel
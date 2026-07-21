const videosRepository = require("../repositories/videos-repository")
const HttpError = require("../error/http-error")

const videosModel = {
  retornarUmVideo: async (id) => {
    const video = await videosRepository.retorneUmVideoPeloId(id)
    if (!video) throw new HttpError(404, "esse vídeo não existe.")
    return video
  },

  atualizarVideo: async (id, data) => {
    await videosModel.retornarUmVideo(id)
    const videoAtualizado = await videosRepository.atualizeUmVideo(id, data)
    return videoAtualizado
  }
}

module.exports = videosModel
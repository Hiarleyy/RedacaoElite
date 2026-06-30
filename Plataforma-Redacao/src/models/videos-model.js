const videosRepository = require("../repositories/videos-repository")
const HttpError = require("../error/http-error")

const videosModel = {
  retornarUmVideo: async (id) => {
    const video = await videosRepository.retorneUmVideoPeloId(id)
    if (!video) throw new HttpError(404, "esse vídeo não existe.")
    return video
  }
}

module.exports = videosModel
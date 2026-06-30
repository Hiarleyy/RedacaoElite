const prisma = require("../database/db")
const Video = require("../entities/Video")

const videosRepository = {
  // Retorna um vídeo em específico
  retorneUmVideoPeloId: async (id) => {
    const video = await prisma.video.findUnique({ 
      where: { id }, 
      select: { 
        id: true,
        titulo: true,
        url: true,
        ordem: true,
        modulo: true 
      } 
    })

    return video
  },

  // Crie um novo vídeo
  crieNovoVideo: async (data) => {
    const video = new Video(data)
    const novoVideo = await prisma.video.create({ data: video })
    return novoVideo
  }
}

module.exports = videosRepository
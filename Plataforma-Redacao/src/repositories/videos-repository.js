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
        thumbnail: true,
        descricao: true,
        duracao: true,
        nivel: true,
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
  },

  // Atualiza um vídeo
  atualizeUmVideo: async (id, data) => {
    const video = new Video({ ...data, id });
    const videoAtualizado = await prisma.video.update({
      where: { id },
      data: {
        titulo: video.titulo,
        url: video.url,
        ordem: video.ordem,
        thumbnail: video.thumbnail,
        descricao: video.descricao,
        duracao: video.duracao,
        nivel: video.nivel
      }
    });
    return videoAtualizado;
  },

  // Deleta todos os vídeos de um módulo
  deletarVideosDoModulo: async (moduloId) => {
    const deletados = await prisma.video.deleteMany({ where: { moduloId } });
    return deletados;
  }
}

module.exports = videosRepository
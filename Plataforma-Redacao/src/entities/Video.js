const { v4: uuid } = require("uuid");

class Video {
  constructor(video) {
    this.id = video.id || uuid();
    this.titulo = video.titulo;
    this.url = video.url;
    this.ordem = video.ordem;
    this.thumbnail = video.thumbnail;
    this.moduloId = video.moduloId;
    this.descricao = video.descricao || null;
    this.duracao = video.duracao || null;
    this.nivel = video.nivel || null;
  }
}

module.exports = Video;
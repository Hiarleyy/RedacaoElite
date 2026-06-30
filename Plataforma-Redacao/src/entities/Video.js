const { v4: uuid } = require("uuid");

class Video {
  constructor(video) {
    this.id = uuid();
    this.titulo = video.titulo;
    this.url = video.url;
    this.ordem = video.ordem;
    this.thumbnail = video.thumbnail;
    this.moduloId = video.moduloId;
  }
}

module.exports = Video;
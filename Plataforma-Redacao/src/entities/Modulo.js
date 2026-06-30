const { v4: uuid } = require("uuid");

class Modulo {
  constructor(modulo) {
    this.id = uuid();
    this.nome = modulo.nome;
    this.descricao = modulo.descricao;
    this.playlistUrl = modulo.playlistUrl;
  }
}

module.exports = Modulo;
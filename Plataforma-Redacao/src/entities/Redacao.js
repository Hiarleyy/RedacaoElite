const { v4: uuid } = require("uuid");

class Redacao {
  constructor(redacao) {
    this.id = uuid();
    this.titulo = redacao.titulo;
    this.caminho = redacao.caminho;
    this.status = redacao.status?.toUpperCase() ?? "PENDENTE";
    this.usuarioId = redacao.usuarioId; 
  }
}

module.exports = Redacao;

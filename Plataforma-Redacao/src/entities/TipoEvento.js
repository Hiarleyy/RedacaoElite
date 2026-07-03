const { v4: uuid } = require("uuid");

class TipoEvento {
  constructor(data) {
    this.id = uuid();
    this.nome = data.nome;
    this.cor = data.cor;
  }
}

module.exports = TipoEvento;

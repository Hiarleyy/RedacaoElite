
const { v4: uuid } = require("uuid");

class Proposta {
  constructor(proposta) {
    this.id = uuid();
    this.tema = proposta.tema;
    this.caminho = proposta.caminho;
    // data will be set to default by Prisma
  }
}

module.exports = Proposta;
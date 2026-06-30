const { v4: uuid } = require("uuid");

class Turma {
  constructor(turma) {
    this.id = uuid();
    this.nome = turma.nome;
  }
}

module.exports = Turma;
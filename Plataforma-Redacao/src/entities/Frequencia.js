const { v4: uuid } = require("uuid");

class Frequencia {
  constructor(frequencia) {
    this.id = uuid();
    this.usuarioId = frequencia.usuarioId;
    this.turmaId = frequencia.turmaId;
    this.status = frequencia.status;
    this.justificativa = frequencia.justificativa;
  }
}

module.exports = Frequencia;

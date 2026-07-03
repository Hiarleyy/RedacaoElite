const { v4: uuid } = require("uuid");

class Frequencia {
  constructor(frequencia) {
    this.id = uuid();
    this.usuarioId = frequencia.usuarioId;
    this.turmaId = frequencia.turmaId;
    this.status = frequencia.status;
    this.justificativa = frequencia.justificativa;
    // Usa a data enviada pelo front-end (data local do Brasil) ou a data atual
    if (frequencia.data) {
      this.data = new Date(frequencia.data);
    }
  }
}

module.exports = Frequencia;

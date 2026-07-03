const { v4: uuid } = require("uuid");

class CalendarioAcademico {
  constructor(evento) {
    this.id = uuid();
    this.titulo = evento.titulo;
    this.descricao = evento.descricao || null;
    this.dataInicio = new Date(evento.dataInicio);
    this.dataFim = new Date(evento.dataFim);
    this.cor = evento.cor || null;
    this.tipoEventoId = evento.tipoEventoId || null;
  }
}

module.exports = CalendarioAcademico;

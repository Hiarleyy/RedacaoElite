const { v4: uuid } = require("uuid");


class NotasSimulado {
  constructor(notasSimulado) {
    this.id = uuid();
    this.simuladoId = notasSimulado.simuladoId;
    this.usuarioId = notasSimulado.usuarioId;
    this.competencia01 = notasSimulado.competencia01;
    this.competencia02 = notasSimulado.competencia02;
    this.competencia03 = notasSimulado.competencia03;
    this.competencia04 = notasSimulado.competencia04;
    this.competencia05 = notasSimulado.competencia05;
    this.notaGeral = notasSimulado.notaGeral;
  }
}

module.exports = NotasSimulado
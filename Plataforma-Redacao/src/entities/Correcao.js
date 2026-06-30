const { v4: uuid } = require("uuid");

class Correcao {
  constructor(correcao) {
    this.id = uuid();
    this.competencia01 = correcao.competencia01;
    this.competencia02 = correcao.competencia02;
    this.competencia03 = correcao.competencia03;
    this.competencia04 = correcao.competencia04;
    this.competencia05 = correcao.competencia05;
    this.nota = (
      this.competencia01 + 
      this.competencia02 +
      this.competencia03 +
      this.competencia04 +
      this.competencia05
    );
    this.caminho = correcao.caminho;
    this.feedback = correcao.feedback
    this.redacaoId = correcao.redacaoId;
  }
}

module.exports = Correcao;

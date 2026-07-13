const { v4: uuid } = require("uuid");

class Proposta {
  constructor(proposta) {
    this.id = uuid();
    this.tema = proposta.tema;
    this.dataInicial = proposta.dataInicial;
    this.dataFinal = proposta.dataFinal;
    this.eixos = proposta.eixos;
    
    if (proposta.MaterialApoio && proposta.MaterialApoio.length > 0) {
      this.materiais = {
        create: proposta.MaterialApoio.map(m => ({
          id: uuid(),
          tipo: m.tipo,
          caminho: m.caminho,
          nome: m.nome
        }))
      };
    }
  }
}

module.exports = Proposta;

const { v4: uuid } = require("uuid");

class Pagamento {
  constructor(pagamento) {
    this.id = uuid();
    this.tipoDespensa = pagamento.tipoDespensa,
    this.dataPagamento = pagamento.dataPagamento,
    this.valor = pagamento.valor,
    // Converte "SAÍDA" para "SAIDA" (valor do enum no Prisma)
    this.status = pagamento.status === "SAÍDA" ? "SAIDA" : pagamento.status
  }
}

module.exports = Pagamento;
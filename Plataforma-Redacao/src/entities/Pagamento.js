
const { v4: uuid } = require("uuid");

class Pagamento {
  constructor(pagamento) {
    this.id = uuid();
    this.tipoDespensa = pagamento.tipoDespensa;
    this.dataPagamento = pagamento.dataPagamento ? new Date(pagamento.dataPagamento) : null;
    this.dataVencimento = pagamento.dataVencimento ? new Date(pagamento.dataVencimento) : null;
    this.valor = pagamento.valor;
    // Converte "SAÍDA" para "SAIDA" (valor do enum no Prisma)
    this.status = pagamento.status === "SAÍDA" ? "SAIDA" : pagamento.status;
    this.usuarioId = pagamento.usuarioId || null;
  }
}

module.exports = Pagamento;
const { v4: uuid } = require("uuid")

class Matricula {
  constructor(data) {
    this.id                  = uuid()
    this.usuarioId           = data.usuarioId
    this.cpf                 = data.cpf
    this.dataNascimento      = data.dataNascimento ? new Date(data.dataNascimento) : null
    this.genero              = data.genero         ?? null
    this.telefone            = data.telefone
    this.endereco            = data.endereco        ?? null
    this.bairro              = data.bairro          ?? null
    this.cidade              = data.cidade          ?? null
    this.nomeResponsavel     = data.nomeResponsavel     ?? null
    this.vinculoResponsavel  = data.vinculoResponsavel  ?? null
    this.telefoneResponsavel = data.telefoneResponsavel ?? null
    this.dataInicio          = new Date(data.dataInicio)
    this.comoConheceu        = data.comoConheceu  ?? null
    this.observacoes         = data.observacoes   ?? null
  }
}

module.exports = Matricula

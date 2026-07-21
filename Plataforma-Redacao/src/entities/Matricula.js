const { encrypt } = require("../utils/crypto")
const { v4: uuid } = require("uuid")

class Matricula {
  constructor(data) {
    this.id = uuid()
    this.usuarioId = data.usuarioId
    this.cpf = encrypt(data.cpf)
    this.dataNascimento = data.dataNascimento ? encrypt(String(data.dataNascimento)) : null
    this.genero = data.genero ? encrypt(data.genero) : null
    this.telefone = encrypt(data.telefone)
    this.endereco = data.endereco ? encrypt(data.endereco) : null
    this.bairro = data.bairro ? encrypt(data.bairro) : null
    this.cidade = data.cidade ? encrypt(data.cidade) : null
    this.nomeResponsavel = data.nomeResponsavel ? encrypt(data.nomeResponsavel) : null
    this.vinculoResponsavel = data.vinculoResponsavel ? encrypt(data.vinculoResponsavel) : null
    this.telefoneResponsavel = data.telefoneResponsavel ? encrypt(data.telefoneResponsavel) : null
    this.dataInicio = encrypt(String(data.dataInicio))
    this.diaVencimento = data.diaVencimento ? encrypt(String(data.diaVencimento)) : null
    this.comoConheceu = data.comoConheceu ? encrypt(data.comoConheceu) : null
    this.observacoes = data.observacoes ?? null
    this.condicaoMedica = data.condicaoMedica ? encrypt(data.condicaoMedica) : null
    this.deficiencia = data.deficiencia ? encrypt(data.deficiencia) : null
    this.necessidadeEducacional = data.necessidadeEducacional ? encrypt(data.necessidadeEducacional) : null
  }
}

module.exports = Matricula

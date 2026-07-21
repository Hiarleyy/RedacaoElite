const { v4: uuid } = require("uuid");

class Usuario {
  constructor(usuario) {
    this.id = uuid();
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.caminho = usuario.caminho;
    this.password = usuario.password
    this.tipoUsuario = usuario.tipoUsuario?.toUpperCase() ?? "STANDARD";
    this.turmaId = usuario.turmaId ?? null;
    this.diaVencimentoPadrao = usuario.diaVencimentoPadrao ?? null;
    this.valorMensalidadePadrao = usuario.valorMensalidadePadrao ?? null;
  }
}

module.exports = Usuario;
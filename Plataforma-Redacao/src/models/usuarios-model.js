const usuariosRepository = require("../repositories/usuarios-repository")
const HttpError = require("../error/http-error")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { criarUsuarioSchema, atualizarUsuarioSchema } = require("../schemas/usuarios-schema")
const { loginSchema } = require("../schemas/login-schema")
const turmaModel = require("./turmas-model")

const tokenSecretKey = "senha-super-secreta"

const usuariosModel = {
  retornarUsuarios: async (filter) => {
    if (filter) {
      const usuarios = await usuariosRepository.retorneAlunosPorNome(filter)
      return usuarios
    }
    
    const usuarios = await usuariosRepository.retorneTodosOsUsuarios()
    return usuarios
  },

  retornarUmUsuario: async (id) => {
    const usuario = await usuariosRepository.retorneUmUsuarioPeloId(id)
    if (!usuario) throw new HttpError(404, "esse usuário não existe.")
    return usuario
  },

  criarUsuario: async (data) => {
    // Vericando se o corpo da requisição respeita o formato de validação do zod
    const corpo = criarUsuarioSchema.safeParse(data)
    
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: Verifique se os dados enviados estão corretos.")
    } 

    // Verificando se a turma existe
    await turmaModel.retornarTurma(corpo.data.turmaId)

    // Verificando se o email já foi cadastrado
    const emailExiste = await usuariosRepository.retorneUmUsuarioPeloEmail(corpo.data.email)
    if (emailExiste) throw new HttpError(409, "Esse email já foi cadastrado no sistema.")

    // Criptografando a senha
    const regex = /^([^@]+)@([^@]+\.[^@]+)$/
    const value = corpo.data.email.match(regex)
    const hashedPassword = await bcrypt.hash(value[1], 10)

    const usuario = await usuariosRepository.crieNovoUsuario({
      nome: corpo.data.nome,
      email: corpo.data.email,
      password: hashedPassword,
      tipoUsuario: corpo.data.tipoUsuario,
      turmaId: corpo.data.turmaId
    })

    return usuario
  },

  logarUsuario: async (data) => {
    // Vericando se o corpo da requisição respeita o formato de validação do zod
    const corpo = loginSchema.safeParse(data)

    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: Verifique se os dados enviados estão corretos.")
    } 

    const { email, password } = corpo.data

    const user = await usuariosRepository.retorneUmUsuarioPeloEmail(email)
  
    if (!user) throw new HttpError(404, "Usuário não encontrado.")
  
    const isSamePassword = await bcrypt.compare(password, user.password)
    if (!isSamePassword) throw new HttpError(401, "Senha inválida.")
  
    const payload = { userId: user.id }

    const token = jwt.sign(payload, tokenSecretKey, {
      expiresIn: "60m",
    })
  
    return { token, id: user.id, role: user.tipoUsuario }
  },

  atualizarUsuario: async (id, data) => {
    // Vericando se o corpo da requisição respeita o formato de validação do zod
    const corpo = atualizarUsuarioSchema.safeParse(data)
    
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: Verifique se os dados enviados estão corretos.")
    } 

    // Verificando se o usuário existe
    await usuariosModel.retornarUmUsuario(id)

    const usuarioAtualizado = await usuariosRepository.atualizeUmUsuario(id, corpo.data)
    return usuarioAtualizado
  },
  deletarUsuario: async (id) => {
    // Verificando se o usuário existe
    await usuariosModel.retornarUmUsuario(id)

    const usuarioDeletado = await usuariosRepository.deleteUmUsuario(id)
    return usuarioDeletado
  },
  
  adicionarFotoDePerfil: async (id, caminho) => {
    await usuariosModel.retornarUmUsuario(id)
    
    const usuarioAtualizado = await usuariosRepository.atualizarFotoUsuario(id, caminho)
    return usuarioAtualizado
  },

  resetarSenha: async (userId) => {
    const usuario = await usuariosModel.retornarUmUsuario(userId)

    const regex = /^(.*?)@gmail\.com$/
    const value = usuario.email.match(regex)
    const hashedPassword = await bcrypt.hash(value[1], 10)

    await usuariosRepository.atualizarSenhaUsuario(userId, hashedPassword)
  },

  atualizarSenha: async (id, data) => {
    const usuario = await usuariosRepository.retorneUsuarioComSenhaPeloId(id)

    if (!data.senhaAtual || !data.novaSenha) {
      throw new HttpError(400, "Senha atual e nova senha são obrigatórios")
    }

    // Verificar se o usuário existe
    if (!usuario) {
      throw new HttpError(404, "Usuário não encontrado")
    }

    const senhaCorreta = await bcrypt.compare(data.senhaAtual, usuario.password)
    if (!senhaCorreta) {
      throw new HttpError(401, "Senha atual incorreta")
    }

    const hashedPassword = await bcrypt.hash(data.novaSenha, 10)
    const usuarioAtualizado = await usuariosRepository.atualizarSenhaUsuario(id, hashedPassword)
    
    return usuarioAtualizado
  }
}

  

module.exports = usuariosModel
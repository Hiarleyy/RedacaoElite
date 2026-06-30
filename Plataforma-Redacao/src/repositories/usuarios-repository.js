const prisma = require("../database/db")
const Usuario = require("../entities/Usuario")
const deletarArquivo = require("../utils/deletar-arquivo")

const usuariosRepository = {
  // Retorna todos os usuários do bando de dados
  retorneTodosOsUsuarios: async () => {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        caminho: true,
        tipoUsuario: true
      },
      orderBy: { nome: 'asc' }
    })

    return usuarios
  },

  // Retorna um usuário específico pelo id
  retorneUmUsuarioPeloId: async (id) => {
    const usuario = await prisma.usuario.findUnique({ where: { id }, select: {
      id: true,
      nome: true,
      email: true,
      caminho: true,
      tipoUsuario: true,
      dataCriacao: true,
      dataAtualizacao: true,
      turmaId: true
    }})
    return usuario
  },

  // Retorna um usuário específico pelo id incluindo a senha (para verificação de autenticação)
  retorneUsuarioComSenhaPeloId: async (id) => {
    const usuario = await prisma.usuario.findUnique({ 
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        password: true,
        caminho: true,
        tipoUsuario: true,
        dataCriacao: true,
        dataAtualizacao: true,
        turmaId: true
      }
    })
    return usuario
  },

  // Retorna todos os alunos cujo nome contém o texto fornecido
  retorneAlunosPorNome: async (nome) => {
    const alunos = await prisma.usuario.findMany({
      where: {
        nome: {
          contains: nome,
          mode: "insensitive"
        }
      }
    })

    return alunos
  },

   // Retorna um usuário específico pelo email
   retorneUmUsuarioPeloEmail: async (email) => {
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    return usuario
  },

  // Crie um novo usuário
  crieNovoUsuario: async (data) => {
    const usuario = new Usuario(data)
    const novoUsuario = await prisma.usuario.create({ data: usuario, select: { 
      nome: true, email: true, tipoUsuario: true } 
    })

    return novoUsuario
  },

  // Atualize um usuário
  atualizeUmUsuario: async (id, data) => {
    const usuarioAtualizado = await prisma.usuario.update({
      data,
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        caminho: true,
        tipoUsuario: true,
        dataCriacao: true,
        dataAtualizacao: true,
        turmaId: true
      }
    })

    return usuarioAtualizado
  },
  atualizarFotoUsuario: async (id, caminho) => {
    const usuarioAtualizado = await prisma.usuario.update({
      data: { caminho },
      where: { id }
    })

    return usuarioAtualizado
  },

  // Atualizar a senha do usuário
  atualizarSenhaUsuario: async (id, hashedPassword) => {
    const usuarioAtualizado = await prisma.usuario.update({
      data: { password: hashedPassword },
      where: { id }
    })

    return usuarioAtualizado
  },

  // Delete um usuário
  deleteUmUsuario: async (id) => {
    const usuarioDeletado = await prisma.usuario.delete(
      { where: { id }, select: {
        nome: true, email: true, tipoUsuario: true
      }}
    )

    // Deletando os arquivos do usuário na pasta uploads
    deletarArquivo(["uploads", "redacoes", id])
    deletarArquivo(["uploads", "correcoes", id])
    deletarArquivo(["uploads", "profile", id])

    return usuarioDeletado
  }
}

module.exports = usuariosRepository
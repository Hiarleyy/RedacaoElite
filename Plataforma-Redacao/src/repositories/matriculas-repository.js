const prisma = require("../database/db")
const Matricula = require("../entities/Matricula")

const matriculasRepository = {
  // Cria uma nova matrícula vinculada ao usuário
  crieNovaMatricula: async (data) => {
    const matricula = new Matricula(data)

    const novaMatricula = await prisma.matricula.create({
      data: matricula,
      select: {
        id:                  true,
        usuarioId:           true,
        cpf:                 true,
        dataNascimento:      true,
        genero:              true,
        telefone:            true,
        endereco:            true,
        bairro:              true,
        cidade:              true,
        nomeResponsavel:     true,
        vinculoResponsavel:  true,
        telefoneResponsavel: true,
        dataInicio:          true,
        comoConheceu:        true,
        condicaoMedica:      true,
        deficiencia:         true,
        necessidadeEducacional: true,
        dataCriacao:         true,
        usuario: {
          select: { id: true, nome: true, email: true, turmaId: true }
        }
      }
    })

    return novaMatricula
  },

  // Retorna todas as matrículas (com dados do usuário)
  retorneTodasAsMatriculas: async () => {
    return await prisma.matricula.findMany({
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, turmaId: true, turma: { select: { nome: true } } }
        }
      },
      orderBy: { dataCriacao: "desc" }
    })
  },

  // Retorna uma matrícula pelo usuarioId
  retorneMatriculaPorUsuarioId: async (usuarioId) => {
    return await prisma.matricula.findUnique({
      where: { usuarioId },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, turmaId: true }
        }
      }
    })
  },

  // Retorna uma matrícula pelo id
  retorneMatriculaPorId: async (id) => {
    return await prisma.matricula.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, turmaId: true }
        }
      }
    })
  }
}

module.exports = matriculasRepository

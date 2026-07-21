const prisma = require("../database/db")
const Matricula = require("../entities/Matricula")
const { decrypt, mask } = require("../utils/crypto")

const decryptMatricula = (matricula) => {
  if (!matricula) return null
  return {
    ...matricula,
    cpf: decrypt(matricula.cpf),
    dataNascimento: decrypt(matricula.dataNascimento),
    genero: decrypt(matricula.genero),
    telefone: decrypt(matricula.telefone),
    endereco: decrypt(matricula.endereco),
    bairro: decrypt(matricula.bairro),
    cidade: decrypt(matricula.cidade),
    nomeResponsavel: decrypt(matricula.nomeResponsavel),
    vinculoResponsavel: decrypt(matricula.vinculoResponsavel),
    telefoneResponsavel: decrypt(matricula.telefoneResponsavel),
    dataInicio: decrypt(matricula.dataInicio),
    comoConheceu: decrypt(matricula.comoConheceu),
    condicaoMedica: decrypt(matricula.condicaoMedica),
    deficiencia: decrypt(matricula.deficiencia),
    necessidadeEducacional: decrypt(matricula.necessidadeEducacional),
    diaVencimento: decrypt(matricula.diaVencimento)
  }
}

const decryptAndMaskMatricula = (matricula) => {
  if (!matricula) return null
  const dec = decryptMatricula(matricula)
  return {
    ...dec,
    cpf: mask(dec.cpf, "cpf"),
    telefone: mask(dec.telefone, "telefone"),
    dataNascimento: mask(dec.dataNascimento, "dataNascimento"),
    endereco: mask(dec.endereco, "endereco"),
    bairro: mask(dec.bairro, "bairro"),
    cidade: mask(dec.cidade, "cidade"),
    nomeResponsavel: mask(dec.nomeResponsavel, "nomeResponsavel"),
    vinculoResponsavel: mask(dec.vinculoResponsavel, "vinculoResponsavel"),
    telefoneResponsavel: mask(dec.telefoneResponsavel, "telefoneResponsavel"),
    dataInicio: mask(dec.dataInicio, "dataInicio"),
    comoConheceu: mask(dec.comoConheceu, "comoConheceu"),
    genero: mask(dec.genero, "genero"),
    condicaoMedica: mask(dec.condicaoMedica, "condicaoMedica"),
    deficiencia: mask(dec.deficiencia, "deficiencia"),
    necessidadeEducacional: mask(dec.necessidadeEducacional, "necessidadeEducacional"),
    diaVencimento: mask(dec.diaVencimento, "diaVencimento")
  }
}

const matriculasRepository = {
  // Cria uma nova matrícula vinculada ao usuário
  crieNovaMatricula: async (data) => {
    const matricula = new Matricula(data)

    const novaMatricula = await prisma.matricula.create({
      data: matricula,
      select: {
        id: true,
        usuarioId: true,
        cpf: true,
        dataNascimento: true,
        genero: true,
        telefone: true,
        endereco: true,
        bairro: true,
        cidade: true,
        nomeResponsavel: true,
        vinculoResponsavel: true,
        telefoneResponsavel: true,
        dataInicio: true,
        diaVencimento: true,
        comoConheceu: true,
        observacoes: true,
        condicaoMedica: true,
        deficiencia: true,
        necessidadeEducacional: true,
        dataCriacao: true,
        usuario: {
          select: { id: true, nome: true, email: true, turmaId: true }
        }
      }
    })

    return decryptMatricula(novaMatricula)
  },

  // Retorna todas as matrículas (com dados do usuário)
  retorneTodasAsMatriculas: async () => {
    const matriculas = await prisma.matricula.findMany({
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, turmaId: true, turma: { select: { nome: true } } }
        }
      },
      orderBy: { dataCriacao: "desc" }
    })

    return matriculas.map(decryptAndMaskMatricula)
  },

  // Retorna uma matrícula pelo usuarioId
  retorneMatriculaPorUsuarioId: async (usuarioId) => {
    const matricula = await prisma.matricula.findUnique({
      where: { usuarioId },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, turmaId: true }
        }
      }
    })

    return decryptMatricula(matricula)
  },

  // Retorna uma matrícula pelo id
  retorneMatriculaPorId: async (id) => {
    const matricula = await prisma.matricula.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, turmaId: true }
        }
      }
    })
    return decryptMatricula(matricula)
  },

  // Cria ou atualiza uma matrícula vinculada ao usuário
  upsertMatriculaPorUsuarioId: async (usuarioId, data) => {
    const matricula = new Matricula({ ...data, usuarioId })
    const { id, ...dataToUpdate } = matricula

    const salvaMatricula = await prisma.matricula.upsert({
      where: { usuarioId },
      update: dataToUpdate,
      create: matricula,
      select: {
        id: true,
        usuarioId: true,
        cpf: true,
        dataNascimento: true,
        genero: true,
        telefone: true,
        endereco: true,
        bairro: true,
        cidade: true,
        nomeResponsavel: true,
        vinculoResponsavel: true,
        telefoneResponsavel: true,
        dataInicio: true,
        diaVencimento: true,
        comoConheceu: true,
        observacoes: true,
        condicaoMedica: true,
        deficiencia: true,
        necessidadeEducacional: true,
        dataCriacao: true,
        usuario: {
          select: { id: true, nome: true, email: true, turmaId: true }
        }
      }
    })

    return decryptMatricula(salvaMatricula)
  }
}

module.exports = matriculasRepository


const matriculasRepository = require("../repositories/matriculas-repository")
const usuariosRepository   = require("../repositories/usuarios-repository")
const usuariosModel        = require("./usuarios-model")
const HttpError            = require("../error/http-error")
const bcrypt               = require("bcrypt")
const { criarMatriculaSchema, atualizarMatriculaSchema } = require("../schemas/matricula-schema")

const matriculasModel = {
  /**
   * Cria um usuário + matrícula em sequência (transação lógica).
   * O formulário envia nome, email, turmaId e os dados da matrícula
   * num único payload. O model separa e processa cada parte.
   */
  criarMatricula: async (data) => {
    // ── 1. Valida com o schema Zod ──────────────────────────────
    const corpo = criarMatriculaSchema.safeParse(data)
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: Verifique se os dados enviados estão corretos.")
    }

    const {
      nome, email, turmaId,
      cpf, dataNascimento, genero,
      telefone, endereco, bairro, cidade,
      nomeResponsavel, vinculoResponsavel, telefoneResponsavel,
      dataInicio, comoConheceu, observacoes
    } = corpo.data

    // ── 2. Verifica e-mail duplicado ────────────────────────────
    const emailExiste = await usuariosRepository.retorneUmUsuarioPeloEmail(email)
    if (emailExiste) throw new HttpError(409, "Esse e-mail já está cadastrado no sistema.")

    // ── 3. Cria o Usuário (senha padrão = parte local do e-mail) ─
    const regex = /^([^@]+)@/
    const parteLocal = email.match(regex)?.[1] ?? "redacao123"
    const hashedPassword = await bcrypt.hash(parteLocal, 10)

    const novoUsuario = await usuariosRepository.crieNovoUsuario({
      nome,
      email,
      password: hashedPassword,
      tipoUsuario: "STANDARD",
      turmaId
    })

    // ── 4. Busca o usuário recém-criado para obter o id ─────────
    const usuarioCriado = await usuariosRepository.retorneUmUsuarioPeloEmail(email)

    // ── 5. Cria a Matrícula vinculada ao usuário ────────────────
    const novaMatricula = await matriculasRepository.crieNovaMatricula({
      usuarioId: usuarioCriado.id,
      cpf,
      dataNascimento: dataNascimento || null,
      genero:         genero         || null,
      telefone,
      endereco:            endereco            || null,
      bairro:              bairro              || null,
      cidade:              cidade              || null,
      nomeResponsavel:     nomeResponsavel     || null,
      vinculoResponsavel:  vinculoResponsavel  || null,
      telefoneResponsavel: telefoneResponsavel || null,
      dataInicio,
      comoConheceu: comoConheceu || null,
      observacoes:  observacoes  || null
    })

    return novaMatricula
  },

  // Retorna todas as matrículas
  retornarMatriculas: async () => {
    return await matriculasRepository.retorneTodasAsMatriculas()
  },

  // Retorna matrícula por usuarioId
  retornarMatriculaPorUsuarioId: async (usuarioId) => {
    const matricula = await matriculasRepository.retorneMatriculaPorUsuarioId(usuarioId)
    if (!matricula) throw new HttpError(404, "Matrícula não encontrada para esse usuário.")
    return matricula
  },

  // Retorna matrícula por id
  retornarMatriculaPorId: async (id) => {
    const matricula = await matriculasRepository.retorneMatriculaPorId(id)
    if (!matricula) throw new HttpError(404, "Matrícula não encontrada.")
    return matricula
  },

  // Atualiza ou cria uma matrícula vinculada a um usuário existente
  atualizarMatriculaPorUsuarioId: async (usuarioId, data) => {
    // 1. Valida com o schema Zod
    const corpo = atualizarMatriculaSchema.safeParse(data)
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: Verifique se os dados enviados estão corretos.")
    }

    // Verifica se o usuário existe
    const usuarioExiste = await usuariosRepository.retorneUmUsuarioPeloId(usuarioId)
    if (!usuarioExiste) throw new HttpError(404, "Usuário não encontrado.")

    // 2. Faz o upsert da matrícula
    const matricula = await matriculasRepository.upsertMatriculaPorUsuarioId(usuarioId, corpo.data)
    return matricula
  }
}

module.exports = matriculasModel

const redacoesRepository = require("../repositories/redacoes-repository")
const { criarRedacaoSchema } = require("../schemas/redacoes-schema")
const deletarArquivo = require("../utils/deletar-arquivo")
const usuariosModel = require("./usuarios-model")
const HttpError = require("../error/http-error")

const redacoesModel = {
  retornarRedacoes: async (usuarioId = false, corrigidas = false, pendentes = false) => {
    // Verificando se o usuário existe
    if (usuarioId) await usuariosModel.retornarUmUsuario(usuarioId)
    
    // Buscando as redações corrigidas de um usuário específico
    if (usuarioId && corrigidas) return await redacoesRepository.retornarRedacoesCorrigidas(usuarioId)

    // Buscando as redações pendentes de um usuário específico
    if (usuarioId && pendentes) return await redacoesRepository.retornarRedacoesPendentes(usuarioId)

    // Buscando todas as redações corrigidas
    if (corrigidas) return await redacoesRepository.retornarRedacoesCorrigidas()

    // Buscando todas as redações pendentes
    if (pendentes) return await redacoesRepository.retornarRedacoesPendentes()

    // Buscando as redações de um usuário específico
    if (usuarioId) return await redacoesRepository.retorneTodasAsRedacoes(usuarioId)

    // Buscando todas as redações
    return await redacoesRepository.retorneTodasAsRedacoes()
  },

  // Buscando uma redação
  retornarRedacao: async (id) => {
    const redacao = await redacoesRepository.retornaUmaRedacao(id)
    if (!redacao) throw new HttpError(404, "Essa redação não existe.")
    return redacao
  },

  // Criando uma redação
  criarRedacao: async (data) => {
    // Vericando se o corpo da requisição respeita o formato de validação do zod
    const corpo = criarRedacaoSchema.safeParse(data)
    
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: Verifique se os dados enviados estão corretos.")
    } 

    // Verificando se o usuário existe
    await usuariosModel.retornarUmUsuario(corpo.data.usuarioId)

    // Se o usuário tiver 20 redações no total, deletamos a sua redação mais antiga
    const redacoes = await redacoesRepository.retorneTodasAsRedacoes(corpo.data.usuarioId)

    if (redacoes.quantidadeRedacoes === 20) {
      const redacaoMaisAntiga = await redacoesRepository.retorneRedacaoMaisAntiga(corpo.data.usuarioId)
      deletarArquivo(["uploads", "redacoes", corpo.data.usuarioId, redacaoMaisAntiga.caminho])
      await redacoesRepository.deletarUmaRedacao(redacaoMaisAntiga.id)
    }

    // Salva a nova redação no bando de dados
    const redacao = await redacoesRepository.crieNovaRedacao(corpo.data)
    return redacao
  },

  // Deletando uma redação
  deletarRedacao: async (id) => {
    // Verificando se a redação existe
    const redacao = await redacoesModel.retornarRedacao(id)

    // Deletando o arquivo físico da redação
    deletarArquivo(["uploads", "redacoes", redacao.usuarioId, redacao.caminho])

    // Deletando a redação do banco de dados
    const redacaoDeletada = await redacoesRepository.deletarUmaRedacao(id)
    return redacaoDeletada
  }
}

module.exports = redacoesModel
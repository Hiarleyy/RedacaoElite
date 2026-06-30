const correcoesRepository = require("../repositories/correcoes-repository")
const redacoesRepository = require("../repositories/redacoes-repository")
const { criarCorrecaoSchema } = require("../schemas/correcoes-schema")
const redacoesModel = require("./redacoes-model")
const HttpError = require("../error/http-error")
const deletarArquivo = require("../utils/deletar-arquivo")

const correcoesModel = {
  retornarCorrecoes: async () => {
    const correcoes = await correcoesRepository.retorneTodasAsCorrecoes()
    return correcoes
  },

  // Buscando uma correção
  retornarCorrecao: async (id) => {
    console.log("Buscando correção com ID:", id)
    const correcao = await correcoesRepository.retornaUmaCorrecao(id)
    console.log("Correção encontrada:", correcao)
    if (!correcao) throw new HttpError(404, "Essa correção não existe.")
    return correcao
  },

  // Busca o usuário dono da redação corrigida, baseado no id da correção
  retornarUsuarioDaCorrecao: async (id) => {
    const { redacao } = await correcoesRepository.retornarUsuarioDaCorrecao(id)
    const usuarioId = redacao.usuarioId
    return usuarioId
  },

  // Criando uma correção
  criarCorrecao: async (data) => {
    // Vericando se o corpo da requisição respeita o formato de validação do zod
    const corpo = criarCorrecaoSchema.safeParse(data)
    
    if (!corpo.success) {
      throw new HttpError(400, "Erro de validação: Verifique se os dados enviados estão corretos.")
    } 

    // Verificando se a redação existe
    const redacao = await redacoesModel.retornarRedacao(corpo.data.redacaoId)

    // Se o usuário tiver 20 correções no total, deletamos a sua correção mais antiga
    const usuarioId = redacao.usuarioId
    const correcoes = await redacoesModel.retornarRedacoes(usuarioId, true)

    if (correcoes.quantidadeRedacoes === 20) {
      const correcaoMaisAntiga = await redacoesRepository.retorneRedacaoMaisAntiga(usuarioId, true)
      deletarArquivo(["uploads", "correcoes", usuarioId, correcaoMaisAntiga.caminho])
      await correcoesRepository.deletarUmaCorrecao(correcaoMaisAntiga.correcao.id)
    }

    // Marcando redação como corrigida
    await redacoesRepository.marcarRedacaoComoCorrigida(corpo.data.redacaoId)

    // Salva a nova correção no bando de dados
    const correcao = await correcoesRepository.crieNovaCorreção(corpo.data)
    return correcao
  }, 
  atualizarCorrecao: async (id, data) => {
    //Verificando se correção existe
    await correcoesModel.retornarCorrecao(id)
    const updateCorrecao = await correcoesRepository.updateCorrecao(id, data)
    return updateCorrecao
  }
}

module.exports = correcoesModel
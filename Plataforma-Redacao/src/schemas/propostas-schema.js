const { z } = require("zod")

const criarPropostaSchema = z.object({
  tema: z.string(),
  dataInicial: z.date(),
  dataFinal: z.date(),
  eixos: z.array(z.string()),

  MaterialApoio: z.array(z.object({
    tipo: z.string(),
    caminho: z.string(),
    nome: z.string(),
  })),
})

module.exports = {
  criarPropostaSchema
}
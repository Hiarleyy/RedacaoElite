const { z } = require("zod")

const criarPropostaSchema = z.object({
  tema: z.string(),
  caminho: z.string(),
})

module.exports = {
  criarPropostaSchema
}
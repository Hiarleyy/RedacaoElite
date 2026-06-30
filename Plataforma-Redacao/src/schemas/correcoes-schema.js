const { z } = require("zod")

const criarCorrecaoSchema = z.object({
  competencia01: z.number().int().min(0).max(200),
  competencia02: z.number().int().min(0).max(200),
  competencia03: z.number().int().min(0).max(200),
  competencia04: z.number().int().min(0).max(200),
  competencia05: z.number().int().min(0).max(200),
  caminho: z.string(),
  feedback: z.string(),
  redacaoId: z.string().uuid(),
}).strict()

module.exports = {
  criarCorrecaoSchema
}
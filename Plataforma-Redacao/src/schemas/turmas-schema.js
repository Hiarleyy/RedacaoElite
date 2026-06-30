const { z } = require("zod")

const criarTurmaSchema = z.object({
  nome: z.string(),
}).strict()

const atualizarTurmaSchema = z.object({
  nome: z.string().optional(),
}).strict()

module.exports = {
  criarTurmaSchema,
  atualizarTurmaSchema
}
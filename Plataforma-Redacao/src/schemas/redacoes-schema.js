const { z } = require("zod")

const criarRedacaoSchema = z.object({
  titulo: z.string(),
  caminho: z.string(),
  status: z.enum(["PENDENTE", "CORRIGIDA"]).default("PENDENTE"),
  usuarioId: z.string().uuid(),
}).strict()

module.exports = {
  criarRedacaoSchema
}
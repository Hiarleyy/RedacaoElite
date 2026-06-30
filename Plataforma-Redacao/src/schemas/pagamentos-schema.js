const { z } = require("zod")

const criarPagamentoSchema = z.object({
    tipoDespensa: z.string(),
    valor: z.number().positive(),
    status: z.enum(["ENTRADA", "SAÍDA"]),
}).strict()

const atualizarPagamentoSchema = z.object({
  usuarioId: z.string().optional(),
  valor: z.number().positive().optional(),
  dataVencimento: z.string().optional(),
}).strict()

const deletarPagamentoSchema = z.object({
  usuarioId: z.string().optional(),
  valor: z.number().positive().optional(),
  dataVencimento: z.string().optional(),
}).strict()

module.exports = {
  criarPagamentoSchema, 
  atualizarPagamentoSchema,
  deletarPagamentoSchema
}
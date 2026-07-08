const { z } = require("zod")

const criarPagamentoSchema = z.object({
  tipoDespensa: z.string(),
  valor: z.number().positive(),
  status: z.enum(["ENTRADA", "SAÍDA"]),
  usuarioId: z.string().uuid().optional().nullable(),
  dataPagamento: z.string().optional().nullable(),
  dataVencimento: z.string().optional().nullable(),
}).strict()

const atualizarPagamentoSchema = z.object({
  tipoDespensa: z.string().optional(),
  valor: z.number().positive().optional(),
  status: z.enum(["ENTRADA", "SAÍDA"]).optional(),
  usuarioId: z.string().uuid().optional().nullable(),
  dataPagamento: z.string().optional().nullable(),
  dataVencimento: z.string().optional().nullable(),
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
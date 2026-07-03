const { z } = require("zod");

const criarEventoSchema = z.object({
  titulo: z.string().min(1, "O título é obrigatório"),
  descricao: z.string().optional().nullable(),
  dataInicio: z.string().or(z.date()),
  dataFim: z.string().or(z.date()),
  cor: z.string().optional().nullable(),
  tipoEventoId: z.string().optional().nullable(),
}).strict();

const atualizarEventoSchema = z.object({
  titulo: z.string().min(1).optional(),
  descricao: z.string().optional().nullable(),
  dataInicio: z.string().or(z.date()).optional(),
  dataFim: z.string().or(z.date()).optional(),
  cor: z.string().optional().nullable(),
  tipoEventoId: z.string().optional().nullable(),
}).strict();

module.exports = {
  criarEventoSchema,
  atualizarEventoSchema,
};

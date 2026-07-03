const { z } = require("zod");

const criarTipoEventoSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  cor: z.string().min(1, "A cor é obrigatória"),
}).strict();

const atualizarTipoEventoSchema = z.object({
  nome: z.string().min(1).optional(),
  cor: z.string().min(1).optional(),
}).strict();

module.exports = {
  criarTipoEventoSchema,
  atualizarTipoEventoSchema,
};

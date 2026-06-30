const { z } = require("zod");

const criarNotasSimuladoSchema = z.object({
  simuladoId: z.string().uuid(),
  usuarioId: z.string().uuid(),
  competencia01: z.number().int().min(0).max(200),
  competencia02: z.number().int().min(0).max(200),
  competencia03: z.number().int().min(0).max(200),
  competencia04: z.number().int().min(0).max(200),
  competencia05: z.number().int().min(0).max(200),
  notaGeral: z.number().int().min(0).max(1000)
});

module.exports = {
  criarNotasSimuladoSchema,
};
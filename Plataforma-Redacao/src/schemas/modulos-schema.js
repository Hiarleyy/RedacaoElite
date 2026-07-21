const { z } = require("zod")

const criarModuloSchema = z.object({
  nome: z.string(),
  descricao: z.string().optional().nullable(),
  playlistUrl: z.string().url().optional().nullable().or(z.string().max(0)),
  pdfUrl: z.string().optional().nullable().or(z.string().max(0)),
  pdfInfo: z.string().optional().nullable(),
}).strict()

module.exports = {
  criarModuloSchema
}
const { z } = require("zod");

const criarArtigoSchema = z.object({
  titulo: z.string().min(1, "O título é obrigatório").max(200, "O título deve ter no máximo 200 caracteres"),
  subtitulo: z.string().max(255, "O subtítulo deve ter no máximo 255 caracteres").optional().nullable(),
  conteudo: z.string().min(1, "O conteúdo é obrigatório"),
  categoria: z.string().min(1, "A categoria é obrigatória").max(100, "A categoria deve ter no máximo 100 caracteres"),
  tempoLeitura: z.union([z.string(), z.number()]).optional().nullable().transform(val => val ? Number(val) : null),
  destaque: z.string().max(50).optional().default("NENHUM"),
  publicado: z.union([z.boolean(), z.string()]).optional().default(false).transform(val => val === 'true' || val === true),
}).strict();

const atualizarArtigoSchema = z.object({
  titulo: z.string().min(1).max(200, "O título deve ter no máximo 200 caracteres").optional(),
  subtitulo: z.string().max(255, "O subtítulo deve ter no máximo 255 caracteres").optional().nullable(),
  conteudo: z.string().min(1).optional(),
  categoria: z.string().min(1).max(100, "A categoria deve ter no máximo 100 caracteres").optional(),
  tempoLeitura: z.union([z.string(), z.number()]).optional().nullable().transform(val => val ? Number(val) : null),
  destaque: z.string().max(50).optional(),
  publicado: z.union([z.boolean(), z.string()]).optional().transform(val => val === 'true' || val === true),
}).strict();

module.exports = {
  criarArtigoSchema,
  atualizarArtigoSchema,
};

const { z } = require("zod")

const criarModuloSchema = z.object({
  nome: z.string(),
  descricao: z.string(),
  playlistUrl: z.string().url(),
    
}).strict()

module.exports = {
  criarModuloSchema
}
const { z } = require("zod")

const criarFrequenciaSchema = z.object({
    usuarioId: z.string().uuid(),
    turmaId: z.string().uuid(),
    status: z.enum(["PRESENTE", "FALTOU", "JUSTIFICADO"]),
    justificativa: z.string().optional(),

}).strict()

const atualizarFrequenciaSchema = z.object({
    usuarioId: z.string().uuid().optional(),
    turmaId: z.string().uuid().optional(),
    status: z.enum(["PRESENTE", "FALTOU", "JUSTIFICADO"]).optional(),
    justificativa: z.string().optional(),
}).strict()


module.exports = {
  criarFrequenciaSchema, 
  atualizarFrequenciaSchema

}
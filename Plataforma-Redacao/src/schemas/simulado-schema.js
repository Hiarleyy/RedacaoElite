const { z } = require("zod")

const criarSimuladoSchema = z.object({
    turmaId: z.string().uuid(),
    titulo: z.string()
})

module.exports = {
    criarSimuladoSchema
}
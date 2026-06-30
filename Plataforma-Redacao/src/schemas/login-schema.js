const { z } = require("zod")

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
}).strict()

module.exports = { loginSchema }
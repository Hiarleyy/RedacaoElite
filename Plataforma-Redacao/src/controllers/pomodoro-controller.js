const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

class PomodoroController {
  // Cria uma nova sessão Pomodoro
  async create(req, res) {
    try {
      const { tema, duracao, pontos, usuarioId } = req.body

      if (!tema || duracao === undefined || pontos === undefined || !usuarioId) {
        return res.status(400).json({ error: "Dados obrigatórios faltando." })
      }

      const novaSessao = await prisma.pomodoroSession.create({
        data: {
          tema,
          duracao,
          pontos,
          usuarioId
        }
      })

      return res.status(201).json({
        message: "Sessão Pomodoro criada com sucesso",
        data: novaSessao
      })
    } catch (error) {
      console.error("Erro ao criar sessão Pomodoro:", error)
      return res.status(500).json({ error: "Erro interno ao salvar sessão Pomodoro" })
    }
  }

  // Lista todas as sessões Pomodoro de um usuário
  async showByUsuario(req, res) {
    try {
      const { id } = req.params

      if (!id) {
        return res.status(400).json({ error: "ID do usuário não fornecido." })
      }

      const sessoes = await prisma.pomodoroSession.findMany({
        where: { usuarioId: id },
        orderBy: { data: 'desc' }
      })

      return res.status(200).json({
        data: sessoes
      })
    } catch (error) {
      console.error("Erro ao buscar sessões Pomodoro:", error)
      return res.status(500).json({ error: "Erro interno ao buscar sessões Pomodoro" })
    }
  }
}

module.exports = new PomodoroController()

const rankingModel = require("../models/ranking-model")

const rankingController = {
  // GET /ranking
  index: async (req, res, next) => {
    try {
      const { turmaId, tipo, scope } = req.query
      let resposta
      if (scope === "turmas") {
        resposta = await rankingModel.listarRankingDeTurmas(tipo)
      } else {
        resposta = await rankingModel.listarRanking(turmaId, tipo)
      }
      res.status(200).json({ data: resposta })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = rankingController
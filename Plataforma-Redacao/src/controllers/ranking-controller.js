const rankingModel = require("../models/ranking-model")

const rankingController = {
  // GET /ranking
  index: async (req, res, next) => {
    try {
      const resposta = await rankingModel.listarRanking()
      res.status(200).json({ data: resposta })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = rankingController
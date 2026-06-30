const rankingRepository = require("../repositories/ranking-repository")

const rankingModel = {
  listarRanking: async () => {
    const ranking = await rankingRepository.listarRankingDeAlunos()
    return ranking
  }
}

module.exports = rankingModel
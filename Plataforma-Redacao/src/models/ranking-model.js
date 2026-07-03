const rankingRepository = require("../repositories/ranking-repository")

const rankingModel = {
  listarRanking: async (turmaId, tipo) => {
    const ranking = await rankingRepository.listarRankingDeAlunos(turmaId, tipo)
    return ranking
  },
  listarRankingDeTurmas: async (tipo) => {
    const ranking = await rankingRepository.listarRankingDeTurmas(tipo)
    return ranking
  }
}

module.exports = rankingModel
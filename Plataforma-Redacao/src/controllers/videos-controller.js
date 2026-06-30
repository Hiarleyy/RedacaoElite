const videosModel = require("../models/videos-model")

const videosController = {
  // GET /videos/:id
  show: async (req, res, next) => {
    try {
      const { id } = req.params
      const resposta = await videosModel.retornarUmVideo(id)
      res.status(200).json({ data: resposta })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = videosController
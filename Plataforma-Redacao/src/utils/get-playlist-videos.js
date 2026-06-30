const HttpError = require("../error/http-error")
const ytpl = require("ytpl")

const getPlaylistVideos = async (playlistUrl) => {
  try {
    const playlist = await ytpl(playlistUrl, { pages: Infinity })

    const videos = playlist.items.map(video => ({
      titulo: video.title,
      url: video.shortUrl,
      thumbnail: video.bestThumbnail.url,
      ordem: video.index
    }))

    return videos
  } catch (error) {
    throw new HttpError(500, "não foi possível obter os vídeos da playlist.")
  }
}

module.exports = getPlaylistVideos
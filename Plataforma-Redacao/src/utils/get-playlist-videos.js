const HttpError = require("../error/http-error")

const getPlaylistVideos = async (playlistUrl) => {
  try {
    let playlistId = "";
    if (playlistUrl.includes("list=")) {
      playlistId = playlistUrl.split("list=")[1]?.split(/[&#]/)[0];
    } else {
      playlistId = playlistUrl;
    }

    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });

    const html = await response.text();
    const regex = /ytInitialData\s*=\s*({.+?});/;
    const match = html.match(regex);
    if (!match) {
      throw new Error("Não foi possível encontrar ytInitialData no HTML da playlist.");
    }

    const json = JSON.parse(match[1]);
    const sectionList = json.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer;
    if (!sectionList?.contents) {
      throw new Error("Estrutura do JSON da playlist não condiz com o esperado.");
    }

    const firstContent = sectionList.contents[0];
    if (!firstContent.itemSectionRenderer?.contents) {
      throw new Error("itemSectionRenderer não encontrado.");
    }

    const contents = firstContent.itemSectionRenderer.contents;
    const videos = [];

    contents.forEach((item, index) => {
      // 1. Try lockupViewModel (Newer layout)
      if (item.lockupViewModel) {
        const model = item.lockupViewModel;
        const videoId = model.contentId;
        if (videoId) {
          const title = model.metadata?.lockupMetadataViewModel?.title?.content || "Sem título";
          const shortUrl = `https://youtu.be/${videoId}`;
          const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          videos.push({
            titulo: title,
            url: shortUrl,
            thumbnail: thumbnail,
            ordem: index + 1
          });
        }
      }
      // 2. Try playlistVideoRenderer (Older layout / fallback)
      else if (item.playlistVideoRenderer) {
        const model = item.playlistVideoRenderer;
        const videoId = model.videoId;
        if (videoId) {
          const title = model.title?.runs?.[0]?.text || "Sem título";
          const shortUrl = `https://youtu.be/${videoId}`;
          const thumbnails = model.thumbnail?.thumbnails || [];
          const thumbnail = thumbnails[thumbnails.length - 1]?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          videos.push({
            titulo: title,
            url: shortUrl,
            thumbnail: thumbnail,
            ordem: index + 1
          });
        }
      }
    });

    return videos;
  } catch (error) {
    console.error("Erro no getPlaylistVideos:", error.message);
    throw new HttpError(500, "não foi possível obter os vídeos da playlist.")
  }
}

module.exports = getPlaylistVideos
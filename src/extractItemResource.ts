import SearchResult = GoogleAppsScript.YouTube.Schema.SearchResult

export interface ItemResource {
  url: string,
  title: string,
  thumbnailUrl: string,
  channelName: string,
  channelUrl: string
}

export function extractItemResource_(video: SearchResult): ItemResource {
  let itemResource: ItemResource = {
    url: '',
    title: video.snippet.title,
    thumbnailUrl: video.snippet.thumbnails.default.url,
    channelName: video.snippet.channelTitle,
    channelUrl: `https://www.youtube.com/channel/${video.snippet.channelId}`
  }

  if (video.id.videoId) {
    itemResource.url = `https://www.youtube.com/watch?v=${video.id.videoId}`
  } else if (video.id.playlistId) {
    itemResource.url = `https://www.youtube.com/playlist?list=${video.id.playlistId}`
  }

  return itemResource
}

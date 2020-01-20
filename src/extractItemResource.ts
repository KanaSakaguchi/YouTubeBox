import SearchResult = GoogleAppsScript.YouTube.Schema.SearchResult
import Video = GoogleAppsScript.YouTube.Schema.Video
import Playlist = GoogleAppsScript.YouTube.Schema.Playlist

export enum ItemType {
  VIDEO = 'video',
  PLAYLIST = 'playlist'
}

export interface ItemResource {
  id: string,
  type: ItemType,
  url: string,
  title: string,
  thumbnailUrl: string,
  videoLength: string,
  channelName: string,
  channelUrl: string,
  isOrdering?: boolean,
  isOrdered? :boolean,
  orderUser?: string
}

export function extractItemResource_(video: SearchResult): ItemResource {
  let itemResource: ItemResource = {
    id: '',
    type: ItemType.VIDEO,
    url: '',
    title: video.snippet.title,
    thumbnailUrl: video.snippet.thumbnails.default.url,
    videoLength: '読み込み中',
    channelName: video.snippet.channelTitle,
    channelUrl: `https://www.youtube.com/channel/${video.snippet.channelId}`
  }

  if (video.id.videoId) {
    itemResource.id = video.id.videoId
    itemResource.url = `https://www.youtube.com/watch?v=${itemResource.id}`
  } else if (video.id.playlistId) {
    itemResource.id = video.id.playlistId
    itemResource.type = ItemType.PLAYLIST
    itemResource.url = `https://www.youtube.com/playlist?list=${itemResource.id}`
  }

  return itemResource
}

export function extractVideoResource_(video: Video): ItemResource {
  return {
    id: video.id,
    type: ItemType.VIDEO,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    title: video.snippet.title,
    thumbnailUrl: video.snippet.thumbnails.default.url,
    videoLength: exchangeTime_(video.contentDetails.duration),
    channelName: video.snippet.channelTitle,
    channelUrl: `https://www.youtube.com/channel/${video.snippet.channelId}`
  }
}

export function extractPlaylistResource_(playlist: Playlist): ItemResource {
  return {
    id: playlist.id,
    type: ItemType.PLAYLIST,
    url: `https://www.youtube.com/playlist?list=${playlist.id}`,
    title: playlist.snippet.title,
    thumbnailUrl: playlist.snippet.thumbnails.default.url,
    videoLength: `${playlist.contentDetails.itemCount} videos`,
    channelName: playlist.snippet.channelTitle,
    channelUrl: `https://www.youtube.com/channel/${playlist.snippet.channelId}`
  }
}

function exchangeTime_(duration: string): string {
  let time: RegExpMatchArray

  time = duration.match(/PT(\d+)H(\d+)M(\d+)S/)
  if (time) {
    time.shift()
    return Utilities.formatString('%d:%02d:%02d', ...time)
  }

  time = duration.match(/PT(\d+)M(\d+)S/)
  if (time) {
    time.shift()
    return Utilities.formatString('%d:%02d', ...time)
  }

  time = duration.match(/PT(\d+)S/)
  if (time) {
    time.shift()
    return Utilities.formatString('0:%02d', ...time)
  }

  time = duration.match(/PT(\d+)H(\d+)S/)
  if (time) {
    time.shift()
    return Utilities.formatString('%d:00:%02d', ...time)
  }

  time = duration.match(/PT(\d+)H/)
  if (time) {
    time.shift()
    return Utilities.formatString('%d:00:00', ...time)
  }

  time = duration.match(/PT(\d+)M/)
  if (time) {
    time.shift()
    return Utilities.formatString('%d:00', ...time)
  }

  return duration
}

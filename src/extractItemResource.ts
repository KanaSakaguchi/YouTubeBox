import SearchResult = GoogleAppsScript.YouTube.Schema.SearchResult
import Video = GoogleAppsScript.YouTube.Schema.Video
import Playlist = GoogleAppsScript.YouTube.Schema.Playlist

export enum ItemType {
  VIDEO = 'video',
  PLAYLIST = 'playlist'
}

export interface ItemResource {
  resourceId: string,
  videoId: string,
  type: ItemType,
  url: string,
  title: string,
  thumbnailUrl: string,
  videoLength: string,
  channelName: string,
  channelUrl: string,
  canOrder: boolean,
  isOrdering?: boolean,
  isOrdered? :boolean,
  isDeleting? :boolean,
  orderUser?: string
}

export function extractItemResource_(video: SearchResult): ItemResource {
  let itemResource: ItemResource = {
    resourceId: Utilities.getUuid(),
    videoId: '',
    type: ItemType.VIDEO,
    url: '',
    title: video.snippet.title,
    thumbnailUrl: video.snippet.thumbnails.default.url,
    videoLength: '読み込み中',
    channelName: video.snippet.channelTitle,
    channelUrl: `https://www.youtube.com/channel/${video.snippet.channelId}`,
    canOrder: false
  }

  if (video.id.videoId) {
    itemResource.videoId = video.id.videoId
    itemResource.url = `https://www.youtube.com/watch?v=${itemResource.videoId}`
  } else if (video.id.playlistId) {
    itemResource.videoId = video.id.playlistId
    itemResource.type = ItemType.PLAYLIST
    itemResource.url = `https://www.youtube.com/playlist?list=${itemResource.videoId}`
  }

  return itemResource
}

export function extractVideoResource_(video: Video): ItemResource {
  return {
    resourceId: Utilities.getUuid(),
    videoId: video.id,
    type: ItemType.VIDEO,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    title: video.snippet.title,
    thumbnailUrl: video.snippet.thumbnails.default.url,
    videoLength: exchangeTime_(video.contentDetails.duration),
    channelName: video.snippet.channelTitle,
    channelUrl: `https://www.youtube.com/channel/${video.snippet.channelId}`,
    canOrder: canOrderVideo_(video)
  }
}

export function extractPlaylistResource_(playlist: Playlist): ItemResource {
  return {
    resourceId: Utilities.getUuid(),
    videoId: playlist.id,
    type: ItemType.PLAYLIST,
    url: `https://www.youtube.com/playlist?list=${playlist.id}`,
    title: playlist.snippet.title,
    thumbnailUrl: playlist.snippet.thumbnails.default.url,
    videoLength: `${playlist.contentDetails.itemCount} videos`,
    channelName: playlist.snippet.channelTitle,
    channelUrl: `https://www.youtube.com/channel/${playlist.snippet.channelId}`,
    canOrder: true
  }
}

function canOrderVideo_(video: Video): boolean {
  if (video.contentDetails.duration === 'PT0S') {
    return false
  }
  if (!video.status.embeddable) {
    return false
  }
  if (!video.contentDetails.regionRestriction) {
    return true
  }
  if (!video.contentDetails.regionRestriction.blocked) {
    return true
  }
  if (video.contentDetails.regionRestriction.blocked.indexOf('JP') !== -1) {
    return false
  }
  if (!video.contentDetails.regionRestriction.allowed) {
    return true
  }
  if (video.contentDetails.regionRestriction.allowed.indexOf('JP') === -1) {
    return false
  }
  return true
}

function exchangeTime_(duration: string): string {
  if (duration === 'PT0S') {
    return 'live'
  }

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

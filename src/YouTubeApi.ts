import SearchListResponse = GoogleAppsScript.YouTube.Schema.SearchListResponse
import SearchResult = GoogleAppsScript.YouTube.Schema.SearchResult
import {
  extractItemResource_,
  extractPlaylistResource_,
  extractVideoResource_,
  ItemResource
} from './extractItemResource'

enum OrderType {
  DATE = 'date',
  RATING = 'rating',
  RELEVANCE = 'relevance',
  TITLE = 'title',
  VIEW_COUNT = 'viewCount'
}
enum PublishedPeriod {
  WITHIN_AN_HOUR = 'Within an hour',
  TODAY = 'Today',
  THIS_WEEK = 'This week',
  THIS_MONTH = 'This month',
  THIS_YEAR = 'This year'
}

interface SearchResult2 {
  list: ItemResource[],
  total: number,
  prevPageToken: string,
  nextPageToken: string
}

function search(keyword: string, order: OrderType, publishedPeriod: PublishedPeriod | null, maxResults: number, pageToken: string): SearchResult2 {
  const result: SearchListResponse = YouTube.Search.list('id,snippet',
    {
      q: keyword,
      type: 'video,playlist',
      order: order,
      publishedAfter: exchangePublishedPeriod_(publishedPeriod),
      maxResults: maxResults,
      pageToken: pageToken
    })

  return {
    list: result.items.map((video: SearchResult): ItemResource => extractItemResource_(video)),
    total: result.pageInfo.totalResults,
    prevPageToken: result.prevPageToken,
    nextPageToken: result.nextPageToken
  }
}

export function getVideoResource(videoId: string): ItemResource {
  const video = YouTube.Videos.list('id,snippet,contentDetails,status', {
    id: videoId
  }).items[0]
  if (!video) {
    throw new Error('Failed to get video resource.')
  }

  return extractVideoResource_(video)
}

function getPlaylistResource(playlistId: string): ItemResource {
  const playlist = YouTube.Playlists.list('id,snippet,contentDetails,status', {
    id: playlistId
  }).items[0]
  if (!playlist) {
    throw new Error('Failed to get play list resource.')
  }

  return extractPlaylistResource_(playlist)
}

export function getPlaylistVideos_(playlistId: string, pageToken?: string): ItemResource[] {
  const playlistItems = YouTube.PlaylistItems.list("id,snippet,contentDetails,status", {
    playlistId,
    maxResults: 50, // PlaylistItemsは上限が50になっている
    pageToken
  })

  const videos = playlistItems.items.map(playlistItem => {
    try {
      return getVideoResource(playlistItem.contentDetails.videoId)
    } catch (error) {
      return null
    }
  }).filter(video =>  video)

  if (!videos) {
    return videos
  } else if (playlistItems.nextPageToken) {
    return videos.concat(getPlaylistVideos_(playlistId, playlistItems.nextPageToken))
  } else {
    return videos
  }
}

function exchangePublishedPeriod_(publishedPeriod: PublishedPeriod): string | null {

  let publishedAfter = new Date()
  switch (publishedPeriod) {
    case PublishedPeriod.WITHIN_AN_HOUR:
      publishedAfter.setHours(publishedAfter.getHours() - 1)
      break
    case PublishedPeriod.TODAY:
      publishedAfter.setHours(0)
      publishedAfter.setMinutes(0)
      publishedAfter.setSeconds(0)
      publishedAfter.setMilliseconds(0)
      break
    case PublishedPeriod.THIS_WEEK:
      while (publishedAfter.getDay() > 0) {
        publishedAfter.setDate(publishedAfter.getDate())
      }
      publishedAfter.setHours(0)
      publishedAfter.setMinutes(0)
      publishedAfter.setSeconds(0)
      publishedAfter.setMilliseconds(0)
      break
    case PublishedPeriod.THIS_MONTH:
      publishedAfter.setDate(1)
      publishedAfter.setHours(0)
      publishedAfter.setMinutes(0)
      publishedAfter.setSeconds(0)
      publishedAfter.setMilliseconds(0)
      break
    case PublishedPeriod.THIS_YEAR:
      publishedAfter.setMonth(1)
      publishedAfter.setDate(1)
      publishedAfter.setHours(0)
      publishedAfter.setMinutes(0)
      publishedAfter.setSeconds(0)
      publishedAfter.setMilliseconds(0)
      break
    default:
      publishedAfter = null
  }

  if (publishedAfter) {
    return Utilities.formatDate(publishedAfter, 'GMT', "yyyy-MM-dd'T'HH:mm:ss'Z'")
  }
  return null
}

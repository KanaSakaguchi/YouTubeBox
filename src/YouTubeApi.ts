import SearchListResponse = GoogleAppsScript.YouTube.Schema.SearchListResponse
import SearchResult = GoogleAppsScript.YouTube.Schema.SearchResult
import {
  extractItemResource_,
  extractPlaylistResource_,
  extractVideoResource_,
  ItemResource
} from './extractItemResource'

interface SearchResult2 {
  list: ItemResource[],
  total: number
}

function search(keyword: string): SearchResult2 {
  const result: SearchListResponse = YouTube.Search.list('id,snippet',
    {
      q: keyword,
      type: 'video,playlist'
    })

  return {
    list: result.items.map((video: SearchResult): ItemResource => extractItemResource_(video)),
    total: result.pageInfo.totalResults
  }
}

function getVideoResource(videoId: string): ItemResource {
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

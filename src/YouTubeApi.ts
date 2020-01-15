import SearchListResponse = GoogleAppsScript.YouTube.Schema.SearchListResponse
import SearchResult = GoogleAppsScript.YouTube.Schema.SearchResult
import { extractItemResource_, extractVideoResource_, ItemResource } from './extractItemResource'

function search(keyword: string): ItemResource[] {
  const result: SearchListResponse = YouTube.Search.list('id,snippet',
    {
      q: keyword,
      type: 'video,playlist'
    })

  return result.items.map((video: SearchResult): ItemResource => extractItemResource_(video))
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

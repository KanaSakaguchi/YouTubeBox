import SearchListResponse = GoogleAppsScript.YouTube.Schema.SearchListResponse
import SearchResult = GoogleAppsScript.YouTube.Schema.SearchResult
import { extractItemResource_, ItemResource } from './extractItemResource'

function search(keyword: string): ItemResource[] {
  const result: SearchListResponse = YouTube.Search.list('id,snippet',
    {
      q: keyword,
      type: 'video,playlist'
    })

  return result.items.map((video: SearchResult): ItemResource => extractItemResource_(video))
}

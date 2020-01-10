import SearchListResponse = GoogleAppsScript.YouTube.Schema.SearchListResponse

function search(keyword: string) {
  const result: SearchListResponse = YouTube.Search.list('id,snippet',
    {
      q: keyword
    })

  return result
}

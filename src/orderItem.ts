import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import { ItemResource, ItemType } from "./extractItemResource";
import { getPlaylistVideos_, getPlaylistResource, getVideoResource } from "./YouTubeApi";

function getSheet_(): Sheet {
  const ss: Spreadsheet = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('sheet'))
  return ss.getSheets()[0]
}

function orderByUrl(url: string): ItemResource {
  if (!url.match(/https:\/\/www\.youtube\.com\/(watch\?v=|playlist\?list=).+/)) {
    throw new Error('Invalid URL')
  }

  if (url.indexOf('list') !== -1) {
    const playListId = url.match(/list=([0-9A-Za-z\-]+)/)[1]
    const playlistResource = getPlaylistResource(playListId)
    orderPlaylist_(playlistResource)
    return playlistResource
  }

  const videoId: string = url.match(/v=([0-9A-Za-z\-]+)/)[1]
  const videoResource = getVideoResource(videoId)
  orderVideo_(videoResource)
  return videoResource
}

function orderItem(item: ItemResource) {
  if (item.type === ItemType.VIDEO) {
    orderVideo_(item)
  } else {
    orderPlaylist_(item)
  }
}

function orderVideo_(video: ItemResource) {
  if (!video.canOrder) {
    return
  }
  video.orderUser = Session.getActiveUser().getEmail()
  const sheet: Sheet = getSheet_()
  sheet.getRange(sheet.getLastRow() + 1, 1).setValue(JSON.stringify(video))
}

function orderPlaylist_(playlist: ItemResource) {
  getPlaylistVideos_(playlist.videoId).forEach(video => {
    orderVideo_(video)
  })
}

function getOrders(): ItemResource[] {
  const sheet: Sheet = getSheet_()
  if (sheet.getLastRow() === 1) {
    return []
  }
  return sheet.getSheetValues(2,  1,  sheet.getLastRow() - 1, 1)
    .map((order: Array<string>): ItemResource => JSON.parse(order[0]))
}

function getFirstOrder(): ItemResource {
  const sheet: Sheet = getSheet_()
  return JSON.parse(sheet.getSheetValues(2,  1,  1, 1)[0][0])
}

function existNextVideo() {
  return  getOrders().length > 1
}

function deleteOrder(target: ItemResource): ItemResource {
  const sheet = getSheet_()
  const list = sheet.getSheetValues(2,  1,  sheet.getLastRow() - 1, 1)
  for (let i = 0; i < list.length; i++) {
    const video: ItemResource = JSON.parse(list[i][0])
    if (video.resourceId === target.resourceId) {
      sheet.deleteRow(i + 2)
      return video
    }
  }
}

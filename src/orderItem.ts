import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import { ItemResource, ItemType } from "./extractItemResource";
import { getPlaylistVideos_ } from "./YouTubeApi";

function getSheet_(): Sheet {
  const ss: Spreadsheet = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('sheet'))
  return ss.getSheets()[0]
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
  return sheet.getSheetValues(2,  1,  sheet.getLastRow() - 1, 1)
    .map((order: Array<string>): ItemResource => JSON.parse(order[0]))
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

import Sheet = GoogleAppsScript.Spreadsheet.Sheet;
import Spreadsheet = GoogleAppsScript.Spreadsheet.Spreadsheet;
import { ItemResource, ItemType } from "./extractItemResource";

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
  const sheet: Sheet = getSheet_()
  sheet.getRange(sheet.getLastRow() + 1, 1).setValue(JSON.stringify(video))
}

function orderPlaylist_(playlist: ItemResource) {
  //TODO プレイリストを注文できるようにする
}

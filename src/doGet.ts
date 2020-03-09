function doGet (data) {
  switch (data.pathInfo) {
    case 'player':
      return HtmlService.createHtmlOutputFromFile('src/player').setTitle('YouTube Box - Player')
    case 'order':
      return HtmlService.createHtmlOutputFromFile('src/order').setTitle('YouTube Box - Order')
    default:
      return HtmlService.createHtmlOutputFromFile('src/index').setTitle('Youtube Box')
  }
}

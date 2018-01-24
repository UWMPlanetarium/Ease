var spreadSheet = SpreadsheetApp.openById("1DBDIBHKDEnXinGfvwHC62Yusx94wQomOdOd9s_LOJL0");
var sheet = spreadSheet.getSheetByName("Test");
var database = FirebaseApp.getDatabaseByUrl("https://development-c2673.firebaseio.com/");

function doGet(e) {
	getData();
}

function getData() {
	var params = database.getData("/functions/");
	apiController(params);
}

function apiController(params) {
	sheet.getRange(1, 1).setValue(params.fnct);
	database.updateData("/functions/", {
		response: "Yes"
	});
}
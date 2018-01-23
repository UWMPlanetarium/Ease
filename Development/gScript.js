// Globals
var database = FirebaseApp.getDatabaseByUrl("https://development-c2673.firebaseio.com/");
var cal_id = "q3qhk29ni908mhhrrvrha1lfq0@group.calendar.google.com";

function doGet(e) {
	getData();
}

function getData() {
	var params = database.getData("/functions/");
	apiController(params);
}

function apiController(params) {
	switch(params.fnct) {

		case "createEvent":
			createEvent(params.data);
			break;

		default:
			database.updateData("/functions/", {
				response: "No such function."
			});
			break;

	}
}

// API FUNCTIONS

// CALENDAR
// Create Event
function createEvent(json) { // Required cal_id, {group {groupName, groupType}, event_DATA {calEvent {calStart, calEnd, calID}}}

 	var object = JSON.parse(json);
 	var calendar = CalendarApp.getCalendarById(cal_id);
 	var event = calendar.createEvent(
 		object.group.groupName + " - " + object.group.groupType,
 		new Date(object.event_DATA.calEvent.calStart),
 		new Date(object.event_DATA.calEvent.calEnd)
 	);
 	var id = event.getId();
 	object.event_DATA.calEvent.eventID = id;
 	var res = {
 		response: true,
 		id: id,
 		event_DATA: object.event_DATA
 	};
 	var json = JSON.stringify(res);
 	database.updateData("/functions/", {
 		response: json
 	});

}
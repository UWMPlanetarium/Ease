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

		case "editEvent":
			editEvent(params.data);
			break;

		case "removeEvent":
			removeEvent(params.data);
			break;

		case "createInvoice":
			createInvoice(params.data);
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

// Edit Event
function editEvent(json) { // Required cal_id, {start, end, new_start, new_end, eventID}

	var object = JSON.parse(json);
	var calendar = CalendarApp.getCalendarById(cal_id);
	var event = findEvent(calendar, object);
	if (event !== false) { // event was found!
		event.setTime(new Date(object.new_start), new Date(object.new_end));
		var object = {
			response: true
		};
		var json = JSON.stringify(object);
		database.updateData("/functions/", {
			response: json
		});
	} else { // event wasn't found
		var object = {
			response: false
		};
		var json = JSON.stringify(object);
		database.updateData("/functions/", {
			response: json
		});
	}

}

// Remove Event
function removeEvent(json) { // Required cal_id, {start, end, eventID}

	var object = JSON.parse(json);
	var calendar = CalendarApp.getCalendarById(cal_id);
	var event = findEvent(calendar, object);
	if (event !== false) { // event was found!
		event.deleteEvent();
		var object = {
			response: true
		}
		var json = JSON.stringify(object);
		database.updateData("/functions/", {
			response: json
		});
	} else { // event wasn't found
		var object = {
			response: false
		}
		var json = JSON.stringify(object);
		database.updateData("/functions/", {
			response: json
		});
	}

}

// HELPER findEvent
function findEvent(calendar, object) {
	var events = calendar.getEvents(new Date(object.start), new Date(object.end));
	for (var i = 0; i < events.length; i++) {
		var id = events[i].getId();
		if (events[i].getId() === object.eventID) {
			return events[i];
		}
	}
	return false;
}

// DOCUMENT TEMPLATES
// Invoices
function createInvoice(json) { // Required {calEvent, groupName, groupGroup, numOfPeople, workPhone, cellPhone, activity, program, email, grade, price}

	var object = JSON.parse(json);
	var folder = DriveApp.getFolderById('0B-u8AnaoQYgrQ1dPNnFoTEZYOEE'); // get archives folder
	var template = DriveApp.getFileById('1kZICuh44fu3F5yLCFBZHyIE2O058LPjcRNE7hV1cbyg'); // get template document
	var newID = template.makeCopy(object.name + "_" + object.calEvent + "_invoice", folder).getId(); // make new copy
	var file = DocumentApp.openById(newID);	 // open file
	var body = file.getBody(); // get body of document
	var replace = function(field, value) {
      	if (value === null) {
      		value = ' ';
      	}
		body.replaceText("{" + field + "}", value);
	}
	for (var field in object) {
		replace(field, object[field]);
	}
	var current_date = new Date().toDateString();
	replace('current_date', current_date);
	var url = file.getUrl();
	// Create response object
	var object = {
		url: url,
		id: object.id,
		response: true
	}
	// stringify to json
	var json = JSON.stringify(object);
	database.updateData("/functions/", {
		response: json
	});

}
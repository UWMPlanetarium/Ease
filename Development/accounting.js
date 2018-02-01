var fs = require('fs');
var firebase = require('firebase-admin');
var _progress = require('cli-progress');

// Initialize the app with a service account, granting admin privileges
var serviceAccount = require("./ease_key.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://ease-f60ed.firebaseio.com'
});

var accounting, events, groups;

function main() {

	fs.readFile("new_accounting.json", function(err, data) {
		if (err) return console.log(err);

		accounting = JSON.parse(data);
		console.log("Loaded local accounting JSON");
		loadFirebaseEvents();

	});

}

function loadFirebaseEvents() {

	var db = firebase.database();
	var ref = db.ref("/events");
	ref.once("value", function(snapshot) {

		events = snapshot.val();
		console.log("Loaded Firebase events data");
		loadFirebaseGroups();

	});

}

function loadFirebaseGroups() {

	var db = firebase.database();
	var ref = db.ref("/groups");
	ref.once("value", function(snapshot) {

		groups = snapshot.val();
		console.log("Loaded Firebase groups data");
		crossRef();

	});

}

function crossRef() {

	console.log("Starting search");
	var bar1 = new _progress.Bar({}, _progress.Presets.shades_classic);
	bar1.start(accounting.length, 0);

	var match = 0;
	var array = [];
	var id = 0;

	for (var i = 0; i < accounting.length; i++) {

		var acc_date = new Date(accounting[i].date).toLocaleDateString();
		var flag = false;

		for (var event in events) {

			var eve_date = new Date(events[event].calEvent.date.raw).toLocaleDateString();

			if (acc_date === eve_date) {

				if (parseInt(accounting[i].total) == parseInt(events[event].price)) {

					flag = true;
					++match;

					var group = getGroup(events[event].groupID);

					var obj = {
						_id: id,
						eventID: events[event]._id,
						groupID: group._id,
						total: accounting[i].total,
						date: accounting[i].date,
						payments: accounting[i].payments
					}

					array.push(obj);
					++id;

				}

			}

		}
		
		if (flag === false) { // An event wasn't found

			var obj = {
				_id: id,
				eventID: null,
				groupID: null,
				total: accounting[i].total,
				date: accounting[i].date,
				payments: accounting[i].payments
			}
			
			array.push(obj);
			++id;
			
		}		

		bar1.increment();

	}

	bar1.stop();

	console.log(match + " matches");
	console.log("Building JSON");

	var json = JSON.stringify(array);

	fs.writeFile("consolidated_accounting.json", json, function(err) {
		if (err) return console.log(err);

		console.log("Build complete!");

	});

}

function getGroup(id) {

	for (var group in groups) {

		if (groups[group]._id === id) {
			return groups[group];
		}

	}

}

main();


/*
var db = firebase.database();
var ref = db.ref("/events");
ref.once("value", function(snapshot) {

	crossRef(snapshot);

});
*/

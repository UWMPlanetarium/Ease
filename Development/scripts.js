function main() {

	app.iframe = new app.Iframe();

	var data = {
		group: {
			groupName: "Sam",
			groupType: "School"
		},
		event_DATA: {
			calEvent: {
				calStart: "Tue Jan 23 2018 18:30:00 GMT-0600 (CST)",
				calEnd: "Tue Jan 23 2018 19:30:00 GMT-0600 (CST)",
				eventID: false
			}
		}
	};
	var json = JSON.stringify(data);

	app.iframe.request("createEvent", json).then(function(response) {

		console.log("It worked! The response is:");
		console.log(response);

	}, function(error) {

		console.log("There was an error: " + error);

	});

}

var app = {};

app.Iframe = Backbone.Firebase.Model.extend({
	urlRoot: "https://development-c2673.firebaseio.com/functions/",
	autoSync: true,
	request: function(fnct, data) { // String, Json

		var proxy = this;

		return new Promise(function(resolve, reject) {

			// Set data and push iframe url
			proxy.set({
				fnct: fnct,
				data: data,
				response: false
			});
			$("#iframe").attr("src", "https://script.google.com/macros/s/AKfycbykE61pc7soyWhtW76U9HmvTJ218LPW_flmxCGM7mJi5LYXhr01/exec");

			// Set a stopwatch for 8 seconds, if the response attribute doesn't change, reject the promise
			proxy.listenToOnce(proxy, "change", function() {
				$("#iframe").attr("src", "#");
				resolve(proxy.attributes.response);
			});

			setTimeout(function() {
				if (proxy.attributes.response === false) {
					$("#iframe").attr("src", "#");
					reject(Error("No response from server."));
				}
			}, 8000);

		});

	}
});

$(document).ready(main);
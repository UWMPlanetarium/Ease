function main() {

	app.iframe = new app.Iframe();

	app.iframe.request("generateInvoice", "Test").then(function(response) {

		console.log("It worked! The response is: " + response);

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

			// Clean up
			setTimeout(function() {
				$("#iframe").attr("src", "#");
			});

			// Set a stopwatch for 8 seconds, if the response attribute doesn't change, reject the promise
			var end = new Date().getTime() + 8000;
			while (end > new Date().getTime()) {

				if (proxy.attributes.response !== false) { // Response has changed
					console.log(proxy.attributes.response);
					resolve(proxy.attributes.response);
				}

			}

			reject(Error("No response from server."));

		});

	}
});

main();


/*
		this.callback = callback;
		this.set({
			fnct: fnct,
			data: data
		});
		$("#iframe").attr("src", "https://script.google.com/macros/s/AKfycbykE61pc7soyWhtW76U9HmvTJ218LPW_flmxCGM7mJi5LYXhr01/exec");
		setTimeout(function() {
			$("#iframe").attr("src", "#");
		}, 50);


function main() {
	//$("#iframe").attr("src", "https://script.google.com/macros/s/AKfycbykE61pc7soyWhtW76U9HmvTJ218LPW_flmxCGM7mJi5LYXhr01/exec");
	app.dataModel = new app.DataModel();
	setTimeout(function() {
		app.dataModel.set({
			fnct: "sendEmail",
			data: false
		});
	}, 500);
}

var app = {};
// Backbone Components
var flag = false;

// Models
app.DataModel = Backbone.Firebase.Model.extend({
	urlRoot: "https://development-c2673.firebaseio.com/functions/",
	autoSync: true,
	initialize: function() {
		this.on("change:fnct", this.sendRequest);
		this.on("change:data", this.sendRequest);
		this.on("change:response", this.hearResponse);
	},
	sendRequest: function() {
		if (flag === false) {
			flag = true;
			$("#iframe").attr("src", "https://script.google.com/macros/s/AKfycbykE61pc7soyWhtW76U9HmvTJ218LPW_flmxCGM7mJi5LYXhr01/exec");
			var proxy = this;
			setTimeout(function() {
				$("#iframe").attr("src", "#");
				flag = false;
			}, 2000);
		}
	},
	hearResponse: function() {
		console.log(this.attributes.response);
	}
});

main();

*/
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
// Models

// Iframe model
app.Iframe = Backbone.Firebase.Model.extend({
  urlRoot: "https://development-c2673.firebaseio.com/functions/",
	// urlRoot: "https://development-c2673.firebaseio.com/testFunctions/",
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
			// $("#iframe").attr("src", "https://script.google.com/macros/s/AKfycbyfTK9Mr9ll4QwBcqpX1A80N50tB0NwXQxhUkQ946Dn530pil6O/exec"); // Testing script

			// Set a stopwatch for 8 seconds, if the response attribute doesn't change, reject the promise
			proxy.listenToOnce(proxy, "change", function() {
				$("#iframe").attr("src", "#");
				resolve(JSON.parse(proxy.attributes.response));
			});

			setTimeout(function() {
				if (proxy.attributes.response === false) {
					$("#iframe").attr("src", "#");
					reject(Error("No response from server."));
				}
			}, 15000);

		});

	}
});

// Group model
app.Group = Backbone.Model.extend({
	
	defaults: {
	  id: "",
	  groupName: "",
	  groupGroup: "",
	  groupType: "",
	  cellPhone: "",
	  workPhone: "",
	  email: "",
	}
	
});

// Event model
app.Event = Backbone.Model.extend({
	
	defaults: {
    _id: "",
	  groupID: "",
	  show: "",
	  activity: "",
	  calEvent: {
	    date: {
	      raw: new Date(),
	      string: "",
	      iso: ""
	    },
	    startTime: {
	      raw: "",
	      string: ""
	    },
	    endTime: {
	      raw: "",
	      string: ""
	    },
	    calStart: "",
	    calEnd: "",
	    string: 'No Date Found',
	    calID: "",
	    eventID: ""
	  },
	  price: "",
	  tour: false,
	  invoiceSent: false,
	  printed: false,
	  checkReceived: false,
	  paidStatus: false,
	  finished: false,
	  notes: "",
	  presenter: "",
	  status: "",
    numOfPeople: 0,
    grade: "",
    age: ""
	},
	createCalendarEvent: function(date, startTime, endTime, opts) {

	  var parseTime = function(input) { // time comes in XX:XX military, need to switch it to a string

	    var time = input.split(':');
	    var hours = parseInt(time[0]);
	    if (hours < 12) { // is am
	      return hours + ":" + time[1] + " am";
	    } else if (hours === 12) { // is noon
	      return hours + ":" + time[1] + " pm";
	    } else if (hours > 12) { // is pm
	      hours = hours - 12;
	      return hours + ":" + time[1] + " pm";
	    }

	  };

	  var object = {

			calID: 'nbqhislsj9vvnp8h6tb52dsq6c@group.calendar.google.com',
			// calID: 't3bmshdk6d6ap3grtolvqj9ppk@group.calendar.google.com', // Testing calendar
	    date: {
	      raw: moment(date).format(),
	      iso: moment(date).format("YYYY-MM-DD"),
	      string: moment(date).format("ddd, MMM Do YYYY")
	    },
	    startTime: {
	      raw: startTime,
	      string: parseTime(startTime)
	    },
	    endTime: {
	      raw: endTime,
	      string: parseTime(endTime)
	    },
	    calStart: moment(date + ' ' + startTime).format(), // TODO: Occasionally sets calStart to 'Invalid date' for unknown reason
	    calEnd: moment(date + ' ' + endTime).format(),
	    string: moment(date).format("ddd, MMM Do") + ' @ ' + parseTime(startTime) + ' - ' + parseTime(endTime)
	  };

	  if (!opts) {
	    object.eventID = "";
	  } else if (opts.keepEventId === true) {
	    object.eventID = this.attributes.calEvent.eventID;
	  }

	  return object;

	}
	
});

// General Money Model
app.MoneyModel = Backbone.Model.extend({

	setDates: function() {
	  if (this.attributes.datePosted !== "" && this.attributes.datePosted !== "") {
	    this.set({datePosted: moment(this.attributes.datePosted)});
	  }
	  if (this.attributes.datePaid !== "" && this.attributes.datePaid !== "") {
	    this.set({datePaid: moment(this.attributes.datePaid)});
	  }
	}

});

// Transaction Model
app.TransactionModel = app.MoneyModel.extend({
	
	defaults: {
	  id: "", // int
	  total: "", // int
	  date: "", // moment raw
	  eventID: null, // int if from event, "" if not
	  groupID: null, // int if from group, "" if not
	  payments: []
	}
	
});

// Payment Model
app.PaymentModel = app.MoneyModel.extend({
	
	defaults: {
	  id: "", // int
	  transactionID: "", // int
	  amount: "", // int
	  paymentType: "", // string [from options] | need config model?
	  datePaid: "", // moment raw
	  datePosted: "" //moment raw
	}
	
});

// Project Model
app.ProjectModel = Backbone.Model.extend({

});

// Task Model
app.TaskModel = Backbone.Model.extend({

});

// User Model
app.UserModel = Backbone.Model.extend({

  defaults: {
    id: "", // int
    authorization: false,
    email: "",
    password: "",
    username: ""
  }
  
});	

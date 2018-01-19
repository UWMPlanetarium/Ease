// Models

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
	  grade: ""
	}
	
});

// Event model
app.Event = Backbone.Model.extend({
	
	defaults: {
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
	  numOfPeople: 0
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
	    calStart: moment(date + ' ' + startTime).format(),
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
	  amount: "", // int
	  datePosted: "", // moment raw
	  notes: "", // string
	  paid: "", // bool
	  datePaid: "", //moment raw
	  eventID: "", // int if from event, "" if not
	  groupID: "" // int if from group, "" if not
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

});	

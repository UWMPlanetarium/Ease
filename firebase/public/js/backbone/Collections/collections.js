/*
	Check git branches and make sure this is the most recent version
	
	This script file contains all collections within this application
	
	GroupList -> Collection (Firebase)
	Model -> Group
	Sorting Process
		1. Sort alphabetially by groupName attribute
	Methods:
		getNextID | Process
			1. Iterate through all id's in collection, find the highest, add one
		
	EventList -> Collection (Firebase)
	Model -> Event
	Sorting Process
		1. Get the miliseconds of when the event starts, multiply by -1
		(Sorts Future at top of array to past at bottom of array)
	Methods:
		getID | Process
			1. Given a groupID
			2. Iterate through all events in collection, adding events with that groupID to an array
			3. Return array
		getNextID | Same as GroupList collection
		getUpcomingEvents | Process
			1. Get the current dateTime
			2. Iterate through all events, if event is after (future) of the current dateTime, add to an array
			3. Return array
		getPreviousEvents | Process
			1. Get the current dateTime
			2. Iterate through all events, if event is before (past) of the current dateTime, add to an array
			3. Return array
		getNextEvents | Process
			1. Get upcoming events via getUpcomingEvents
			2. Sort events by calStart attribute
			3. Return events
		getAttendanceByMonth | Process
			1. CHANGING IMMEADIATLY
		getAttendance | Process
			1. CHANGING IMMEADIATLY
	
	TransactionList -> Collection (Firebase)
	Model -> Transaction
	Sorting Process
		1. Get miliseconds of when the transaction was posted, multiply by -1
		(sorts Future at tope of array to past at bottom of array)
	Methods:
		getNextID | Sam as GroupList collection
	
	PaymentList -> Collection (Firebase)
	Model -> Payment
	Sorting Process | Same as Transaction List
	
	Others negligible
*/
app.GroupList = Backbone.Firebase.Collection.extend({
	
	model: app.Group,
	url: 'https://ease-f60ed.firebaseio.com/groups/',
	autoSync: true,
	initialize: function() {
	  this.sort();
	},
	comparator: function(group) {
	  return group.attributes.groupName;
	},
	getNextID: function() {

	  var id = 0;
	  for (var i = 0; i < this.models.length; i++) {

	    if (parseInt(this.models[i].attributes._id) > id) {
	      id = this.models[i].attributes._id;
	    }

	  }
	  ++id;
	  return id;

	}
	
});

// Event list collection
app.EventList = Backbone.Firebase.Collection.extend({
	
	model: app.Event,
	url: 'https://ease-f60ed.firebaseio.com/events/',
	autoSync: true,
	initialize: function() {
	  this.sort();
	},
	comparator: function(event) {
	  return new Date(event.attributes.calEvent.calStart).getTime() * -1;
	},
	getID: function(id) {
	  var output = [];
	  for (var i = 0; i < this.models.length; i++) {
	    if (this.models[i].attributes.groupID === id) {
	      output.push(this.models[i]);
	    }
	  }
	  return output;
	},
	getNextID: function() {

		var id = 0;
		for (var i = 0; i < this.models.length; i++) {

			if (parseInt(this.models[i].attributes._id) > id) {
				id = this.models[i].attributes._id;
			}

		}
		++id;
		return id;

	},
	getUpcomingEvents: function() {

	  var current_date = moment();
	  var output = [];
	  for (var i = 0; i < this.models.length; i++) {

	    var event_date = moment(this.models[i].attributes.calEvent.calStart);
	    if (event_date.isAfter(current_date)) { // The event is after the current date
	      output.push(this.models[i]);
	    }

	  }
	  return output;

	},
	getPreviousEvents: function() {

	  var current_date = moment();
	  var output = [];
	  for (var i = 0; i < this.models.length; i++) {

	    var event_date = moment(this.models[i].attributes.calEvent.calStart);
	    if (current_date.isAfter(event_date)) { // The event is after the current date
	      output.push(this.models[i]);
	    }

	  }
	  return output;    

	},
	getNextEvents: function() {

	  var events = this.getUpcomingEvents();

	  // Need to sort events by date
	  events.sort(function(a, b) {

	    return new Date(a.attributes.calEvent.calStart).getTime() - new Date(b.attributes.calEvent.calStart).getTime();

	  });

	  return events;

	},
	getAttendanceByMonth: function() { // STARTING IN OCTOBER!

	  var output = [683, 1585, 1475, 1540, 1180, 690, 762, 3659, 1505, 0, 0, 0];
	  for (var i = 0; i < this.models.length; i++) {

	    if (this.models[i].attributes.finished === true) { // Show is finished

	      var month = parseInt(moment(this.models[i].attributes.calEvent.calStart).format("M")); // 1 starting list ... weird

	      if (month >= 10) { // October or better, NEEDS TO CHANGE EVENTUALLY!!!!
	        output[month - 1] += parseInt(this.models[i].attributes.numOfPeople);
	      }

	    }

	  }
	  return output;

	},
	getAttendance: function() { // STARTING IN OCTOBER!

	  var output = 13079;
	  for (var i = 0; i < this.models.length; i++) {

	    if (this.models[i].attributes.finished === true) { // Show is finished

	      var month = parseInt(moment(this.models[i].attributes.calEvent.calStart).format("M")); // 1 starting list ... weird

	      if (month >= 10) { // October or better, NEEDS TO CHANGE EVENTUALLY!!!!

	        output += parseInt(this.models[i].attributes.numOfPeople);

	      }

	    }

	  }

	  return output.toLocaleString();

	}
	
});

// Transaction Collection
app.TransactionList = Backbone.Firebase.Collection.extend({
	
	model: app.TransactionModel,
	url: 'https://ease-f60ed.firebaseio.com/transactions/',
	autoSync: true,
	initialize: function() {
	  this.sort();
	},
	comparator: function(transaction) { // sort ascending by date posted
	  return new Date(transaction.attributes.datePosted) * -1;
	},
	getNextID: function() {

	  var id = 0;
	  for (var i = 0; i < this.models.length; i++) {

	    if (parseInt(this.models[i].attributes.id) > id) {
	      id = this.models[i].attributes.id;
	    }

	  }
	  ++id;
	  return id;

	}
	
});

// Payment Collection
app.PaymentList = Backbone.Firebase.Collection.extend({
	
	model: app.PaymentModel,
	url: 'https://ease-f60ed.firebaseio.com/payments/',
	autoSync: true,
	initialize: function() {
	  this.sort();
	},
	comparator: function(payment) { // sort ascending by date posted
	  return new Date(payment.attributes.datePosted) * -1;
	}
	
});

// Projects Collection
app.ProjectList = Backbone.Firebase.Collection.extend({

	model: app.ProjectModel,
	url: 'https://ease-f60ed.firebaseio.com/projects/',
	autoSync: true

});

// Tasks Collection
app.TaskList = Backbone.Firebase.Collection.extend({

	model: app.TaskModel,
	url: 'https://ease-f60ed.firebaseio.com/tasks/',
	autoSync: true

});

app.UserList = Backbone.Firebase.Collection.extend({

	model: app.UserModel,
	url: 'https://ease-f60ed.firebaseio.com/users/',
	autoSync: true

});

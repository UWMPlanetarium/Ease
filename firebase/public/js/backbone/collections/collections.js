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
	// url: 'https://development-c2673.firebaseio.com/groups/',
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
	// url: 'https://development-c2673.firebaseio.com/events/',
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

		// get current year
		var year = new Date().getFullYear();		
		var output = new Array(12).fill(0);

		for (var i = 0; i < this.models.length; i++) {

			// is it the right year?
			if (new Date(this.models[i].attributes.calEvent.date.iso).getFullYear() === year) {

				// Is the show complete?	
				if (this.models[i].attributes.finished === true) {

					var month = parseInt(moment(this.models[i].attributes.calEvent.calStart).format("M")); // 1 starting list ... weird
					var num = parseInt(this.models[i].attributes.numOfPeople);
					if (num > 0) {
						output[month - 1] += num;
					}

				}

			}

		}

		return output;

	},
	getAttendance: function() {

		// Get current year
		var year = new Date().getFullYear();
		var attendance = 0;

		// Loop through events
		for (var i = 0; i < this.models.length; i++) {

			// Is it the right year?
			if (new Date(this.models[i].attributes.calEvent.date.iso).getFullYear() === year) {

				// Is the show complete?
				if (this.models[i].attributes.finished === true) {

					var num = parseInt(this.models[i].attributes.numOfPeople);
					if (num > 0) {
						attendance += num;
					}

				}

			}

		}

		return attendance;

	}
	
});

// Transaction Collection
app.TransactionList = Backbone.Firebase.Collection.extend({
	
	model: app.TransactionModel,
	url: 'https://ease-f60ed.firebaseio.com/transactions/',
	// url: 'https://development-c2673.firebaseio.com/transactions/',
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
			if (parseInt(this.models[i].attributes._id) > id) {
				id = this.models[i].attributes._id;
			}
	  }
	  ++id;
	  return id;
	},
	getIncomeByMonth: function() {

		var array = new Array(12).fill(0);
		var currentYear = new Date().getFullYear();
		for (var i = 0; i < this.models.length; i++) {

			var year = parseInt(this.models[i].attributes.date.substring(0, 4));
			if (year === currentYear) { // yay!
				var total = 0;
				for (var payment in this.models[i].attributes.payments) {
					total += parseInt(this.models[i].attributes.payments[payment].amount);
				}
				var month = new Date(this.models[i].attributes.date).getMonth();
				array[month] += total;
			}

		}
		return array;

	},
	getTotalIncomeByMonth: function() {

		var array = new Array(12).fill(0);
		var currentYear = new Date().getFullYear();
		for (var i = 0; i < this.models.length; i++) {

			var year = parseInt(this.models[i].attributes.date.substring(0, 4));
			if (year === currentYear) { // yay!
				var total = 0;
				for (var payment in this.models[i].attributes.payments) {
					total += parseInt(this.models[i].attributes.payments[payment].amount);
				}
				var month = new Date(this.models[i].attributes.date).getMonth();
				for (month; month >= 0; month--) {
					array[month] += total;
				}
			}

		}
		return array;

	},
	getTotalsByType: function() {

		var obj = {
			Cash: 0,
			Check: 0,
			Credit: 0,
			Interdepartment: 0
		};
		var currentYear = new Date().getFullYear();
		for (var i = 0; i < this.models.length; i++) {

			var year = parseInt(this.models[i].attributes.date.substring(0, 4));
			if (year === currentYear) { // yay!
				var total = 0;
				for (var payment in this.models[i].attributes.payments) {
					obj[this.models[i].attributes.payments[payment].type] += parseInt(this.models[i].attributes.payments[payment].amount);
				}
			}

		}
		var array = [obj.Cash, obj.Check, obj.Credit, obj.Interdepartment];
		return array;	

	},
	getIncomebyGroup: function() {

		var currentYear = new Date().getFullYear();
		var obj = {};
		for (var i = 0; i < this.models.length; i++) {

			var year = parseInt(this.models[i].attributes.date.substring(0, 4));
			if (year === currentYear) { // yay!
				
				if (this.models[i].attributes.groupID !== undefined) {

					var group = app.groupList.where({_id: this.models[i].attributes.groupID})[0];
					var type = group.attributes.groupType;
					var total = 0;
					for (var payment in this.models[i].attributes.payments) {
						total += parseInt(this.models[i].attributes.payments[payment].amount);
					}
					if (obj[type] !== undefined) {
						obj[type] += total;
					} else {
						obj[type] = total;
					}

				}

			}

		}

		var types = [];
		var totals = [];
		for (var type in obj) {
			var index = types.indexOf(type);
			if (index !== -1) {
				totals[index] += obj[type];
			} else {
				types.push(type);
				totals.push(obj[type]);
			}
		}

		return {types: types, totals: totals};

	},
	createDeposit: function(start, end) {

		// Need a list of transactions that occured during this period
		var array = [];
		var m_start = moment(start);
		var m_end = moment(end);
		for (var i = 0; i < this.models.length; i++) {

			var date = moment(this.models[i].attributes.date);
			if (m_start.isBefore(date) && m_end.isAfter(date)) {

				array.push(this.models[i].attributes);

			}

		}

		// Push to google apps server
		var json = JSON.stringify(array);
		app.iframe.request("createDeposit", json).then(function(res) {
			toastr.success("Created!");
			console.log(res);
			window.open(res, "_blank");
		}, function(err) {
			if (err) return console.log(err);
		});

	}
	
});

// Payment Collection
app.PaymentList = Backbone.Firebase.Collection.extend({
	
	model: app.PaymentModel,
	url: 'https://ease-f60ed.firebaseio.com/payments/',
	// url: 'https://development-c2673.firebaseio.com/payments',
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
	// url: 'https://development-c2673.firebaseio.com/projects/',
	autoSync: true

});

// Tasks Collection
app.TaskList = Backbone.Firebase.Collection.extend({

	model: app.TaskModel,
	url: 'https://ease-f60ed.firebaseio.com/tasks/',
	// url: 'https://development-c2673.firebaseio.com/tasks/',
	autoSync: true

});

app.UserList = Backbone.Firebase.Collection.extend({

	model: app.UserModel,
	url: 'https://ease-f60ed.firebaseio.com/users/',
	// url: 'https://development-c2673.firebaseio.com/users/',
  autoSync: true,
  
  getNextId: function() {

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

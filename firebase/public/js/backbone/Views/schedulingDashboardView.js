app.SchedulingDashboardView = Backbone.View.extend({

	template: _.template($('#scheduling-dashboard-template').html()),
	initialize: function() {
		this.listenTo(app.groupList, "all", this.load);
		this.listenTo(app.eventList, "all", this.load);
	},
	render: function() {
		this.$el.html(this.template());
		this.load();
		return this; // chained commands
	},
	load: function() {

		// Num of groups
		this.$el.find('.num_groups').html(app.groupList.length);

		// Num of upcoming events
		var upcoming_events = app.eventList.getUpcomingEvents();
		this.$el.find('.num_upcoming_events').html(upcoming_events.length);

		// Num of unpaid events
		var previous_events = app.eventList.getPreviousEvents();
		var unpaid_events = Helper.arrayWhere(previous_events, 'paidStatus', false);
		this.$el.find('.num_unpaid_events').html(unpaid_events.length);

		// Num of current attendence
		var attendence = app.eventList.getAttendance();
		this.$el.find('.num_current_attendance').html(attendence);

		// Calendar
		if (this.$el.find('#scheduling-dashboard-calendar').children().length > 0) { // Calendar already exists

			var events = Helper.getAllEvents();
			this.$el.find('#scheduling-dashboard-calendar').fullCalendar('removeEvents'); // Remove events
			this.$el.find('#scheduling-dashboard-calendar').fullCalendar('addEventSource', events);


		} else { // Calendar doesn't exist

			var proxy = this;
			var events = Helper.getAllEvents();
			this.$el.find('#scheduling-dashboard-calendar').fullCalendar({
				events: events,
				timezone: 'local',
				eventClick: function(calEvent) {
					proxy.eventClick(calEvent);
				}
			});

			setTimeout(function() {
				$('#scheduling-dashboard-calendar').fullCalendar('render');
			}, 10);

		}

		// Attendance Graph
		setTimeout(function() {

			var data = app.eventList.getAttendanceByMonth();
			var ctx = document.getElementById('attendance-graph').getContext('2d');
			var chart = new Chart(ctx, {
				  // The type of chart we want to create
				  type: 'line',

				  // The data for our dataset
				  data: {
				      labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
				      datasets: [{
				          label: "Monthly attendance",
				          backgroundColor: 'rgb(255, 97, 34)',
				          borderColor: 'rgb(255, 163, 126)',
				          data: data
				      }]
				  },

				  // Configuration options go here
				  options: {
					plugins: {
						datalabels: {
							backgroundColor: function(context) {
								return context.dataset.backgroundColor;
							},
							borderRadius: 4,
							color: 'white',
							font: {
								weight: 'bold'
							},
							formatter: Math.round
						}
					},
					scales: {
						yAxes: [{
							stacked: true
						}]
					}			    	
				  }
			});	

		}, 20);	

		// Upcoming Shows | Get the next 10 shows
		this.$el.find('.upcoming_shows_land').html(' ');
		var upcoming_events_list = app.eventList.getNextEvents();
		for (var i = 0; i < 10; i++) {
			this.addEventListItem(upcoming_events_list[i], '.upcoming_shows_land');
		}

		// Previous Shows | Get the past 10 shows
		this.$el.find('.previous_shows_land').html(' ');
		var past_events_list = app.eventList.getPreviousEvents();
		for (var j = 0; j < 10; j++) {
			this.addEventListItem(past_events_list[j], '.previous_shows_land');
		}

	},
	events: {
		'click .create-event': 'create_event'
	},
	create_event: function() {

		// What's the flow?
		var view = new app.NewEventView();
		$('#modals').html(view.render().el);

	},
	eventClick: function(calEvent) {

		var event = app.eventList.where({_id: calEvent.id});
		var group = app.groupList.where({_id: event[0].attributes.groupID});
		var view = new app.EventDetailView({model: {event: event[0], group: group[0]}});
		$('#modals').html(view.render().el);

	},
	addEventListItem: function(event, element) {

		var group = app.groupList.where({_id: event.attributes.groupID});
		var view = new app.EventListView({model: {event: event, group: group[0]}});
		this.$el.find(element).append(view.render().el);

	}

});

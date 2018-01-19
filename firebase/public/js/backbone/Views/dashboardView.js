/*
	Check git branches to be sure this is the most recent version
	
	DashboardView -> View
	Template -> #dashboard-template
	Methods:
		initialize | Process
			1. Add listeners to all events for the groupList and eventList, route to render function
		load | Process
			1. Get the number of objects in groupList, write to .num_groups element
			2. Get number of eventList.upcomingEvents, write number of objects to .num_upcoming_events element
			3. Get number of elements in projectList, write to .num_projects elements
			4. Get number of incomplete tasks from taskList, write number of elements to .num_incomplete_tasks element
			5. Check to see if the dashboard_calendar already exists
				1. Yes. Get all events from helper, remove events from calendar, re-add the events as a source
				2. No. Get all events from helper, initialize the calendar.
					1. setTimeout is to be sure that the element has been rendered on the page. NECESSARY
		eventClick | Process
			1. Given a special calEvent object (not the same as event.attributes.calEvent object)
			2. Find the corresponding event
			3. Find the corresponding group
			4. Make a new eventDetailView object, render it to #modals element
*/
app.DashboardView = Backbone.View.extend({

	template: _.template($('#dashboard-template').html()),
	initialize: function() {
		this.listenTo(app.groupList, "all", this.render);
		this.listenTo(app.eventList, "all", this.render);
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

		// Num of projects
		this.$el.find('.num_projects').html(app.projectList.length);

		// Num of incomplete tasks
		var tasks = app.taskList.where({completed: false});
		this.$el.find('.num_incomplete_tasks').html(tasks.length);

		// Create calendar
		if (this.$el.find('#dashboard-calendar').children().length > 0) { // Calendar already exists

			var events = Helper.getAllEvents();
			this.$el.find('#dashboard-calendar').fullCalendar('removeEvents');
			this.$el.find('#dashboard-calendar').fullCalendar('addEventSource', events);

		} else { // Calendar doesn't exist yet

			var proxy = this;
			var events = Helper.getAllEvents();
			this.$el.find('#dashboard-calendar').fullCalendar({
				events: events,
				defaultView: 'agendaWeek',
				timezone: 'local',
				eventClick: function(calEvent) {
					proxy.eventClick(calEvent);
				}
			});

			setTimeout(function() {
				$('#dashboard-calendar').fullCalendar('render');
			}, 10);

		}	

	},
	eventClick: function(calEvent) {

		var event = app.eventList.where({_id: calEvent.id});
		var group = app.groupList.where({_id: event[0].attributes.groupID});
		var view = new app.EventDetailView({model: {event: event[0], group: group[0]}});
		$('#modals').html(view.render().el);

	}

});

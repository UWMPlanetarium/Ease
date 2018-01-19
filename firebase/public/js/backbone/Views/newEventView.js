app.NewEventView = Backbone.View.extend({

	template: _.template($('#new-event-view-template').html()),
	render: function() {
		this.$el.html(this.template());
		this.load();
		return this; // chained commands
	},
	load: function() {

		setTimeout(function() {
			$('#modals .modal').modal('show');
		}, 10);

		this.select_group();

	},
	events: {
		'click .new-group-click': 'new_group',
		'click .save-group': 'save_group',
		'click .select-group-click': 'select_group_click',
		'change .calendar-status-change': 'change_scheduling_calendar',
		'click .select-date-click': 'select_date_click',
		'click .confirm-event': 'confirm_event'
	},
	new_group: function() {

		this.$el.find('.select-group').css('display', 'none');
		this.$el.find('.new-group').css('display', 'block');

	},
	save_group: function() {

		// Get variables
		var groupName = this.$el.find('input.groupName').val();
		var groupGroup = this.$el.find('input.groupGroup').val();
		var groupType = this.$el.find('input.groupType').val();
		var grade = this.$el.find('input.grade').val();
		var email = this.$el.find('input.email').val();
		var cellPhone = this.$el.find('input.cellPhone').val();
		var workPhone = this.$el.find('input.workPhone').val();

		console.log(User);

		var group = {
			_id: app.groupList.getNextID(),
			groupName: groupName,
			groupGroup: groupGroup,
			groupType: groupType,
			grade: grade,
			email: email,
			cellPhone: cellPhone,
			workPhone: workPhone,
			dateCreated: moment().format("YYYY-DD-MM"),
			created_by: User.attributes._id
		};

		app.groupList.add(group);

		this.group = app.groupList.where({_id: group._id})[0];
		this.select_date();

	},
	select_group: function() {

		// Get groups
		var groups = Helper.getGroupArray(['groupName', 'groupGroup', 'email'], {selectButton: true});

		this.$el.find('.select-group-table').DataTable({
			data: groups,
			columns: [
				{ data: 'groupName' },
				{ data: 'groupGroup' },
				{ data: 'email' },
				{ data: 'button' }
			]
		});

		this.$el.find('.select-group').css('display', 'block');

	},
	select_group_click: function(e) {

		var id = $(e.currentTarget).attr('group');
		this.group = app.groupList.where({_id: id})[0]; // Get the group based on ID
		if (this.group === undefined) {
			this.group = app.groupList.where({_id: parseInt(id)})[0];
		}
		this.select_date();

	},
	select_date: function() {

		this.$el.find('.select-group').css('display', 'none');
		this.$el.find('.new-group').css('display', 'none');
		this.$el.find('.select-date').css('display', 'block');

		// Show group contact names
		this.$el.find('.select-date .groupName').html(this.group.attributes.groupName);

		// Create scheduling calendar
		var proxy_select = this.select_date_calendar.bind(this);
		google.script.run.withSuccessHandler(proxy_select)
			.getSchedulingEvents();

	},
	select_date_click: function() {

		// Get the date / time data
		this.date = this.$el.find('input.date').val();
		this.startTime = this.$el.find('input.startTime').val();
		this.endTime = this.$el.find('input.endTime').val();

		// Get show details
		this.show_details();

	},
	show_details: function() {

		this.$el.find('.select-date').css('display', 'none');
		this.$el.find('.show-details').css('display', 'block');

	},
	confirm_event: function() {

		// Get show details
		this.show = this.$el.find('input.show_data').val();
		this.activity = this.$el.find('input.activity').val();
		this.presenter = this.$el.find('input.presenter').val();
		this.price = this.$el.find('input.price').val();
		this.numOfPeople = this.$el.find('input.numOfPeople').val();

		// Create model
		var event = {
			groupID: this.group.attributes._id,
			_id: app.eventList.getNextID(),
			show: this.show,
			activity: this.activity,
			presenter: this.presenter,
			price: this.price,
			numOfPeople: this.numOfPeople,
			created_by: User.attributes._id
		};

		event.calEvent = app.eventList.models[0].createCalendarEvent(this.date, this.startTime, this.endTime);

		// Alert user
		toastr.info("Creating event");

		var json = JSON.stringify({event_DATA:event, group:this.group.attributes});

		var proxy = this.create_event.bind(this);
		google.script.run.withSuccessHandler(proxy)
			.createEvent(json);

	},
	create_event: function(json) {

		var object = JSON.parse(json);
		if (object.response === true) {

			toastr.success("Created event");
			app.eventList.add(object.event_DATA);
			var event = app.eventList.where({_id:object.event_DATA._id})[0];

			// Show event detail
			var view = new app.EventDetailView({model:{event:event,group:this.group}});
			$('#modals .modal').modal('hide');

			setTimeout(function() {
				$('#modals').html(view.render().el);
			}, 200);

		}

	},
	select_date_calendar: function(json) {

		this.events = JSON.parse(json);

		// Get EASE events
		var object = {
			events: Helper.getAllEvents(),
			calendar_title: "Ease"
		};

		this.events.push(object);

		this.all_events = jQuery.extend(true, [], this.events);

		// Add checkboxes for calendar viewing
		for (var i = 0; i < this.events.length; i++) {
			this.$el.find('.calendar-status').append(this.events[i].calendar_title + " <input type='checkbox' class='calendar-status-change' checked calendar='" + this.events[i].calendar_title + "' />&nbsp;&nbsp;&nbsp;");
		}

		this.$el.find('#scheduling-new-event-calendar').fullCalendar({
			eventSources: this.events,
			header: {
				left: 'prev,next,today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			},
			defaultView: 'agendaWeek',
			timezone: 'local'
		});

		setTimeout(function() {
			$('#scheduling-new-event-calendar').fullCalendar('render');
		}, 20);

	},
	change_scheduling_calendar: function(e) {

		var calendar = $(e.currentTarget).attr('calendar');
		var state = $(e.currentTarget).is(':checked');

		if (state === false) { // Turn off a calendar

			for (var i = 0; i < this.events.length; i++) {
				if (this.events[i].calendar_title === calendar) {
					this.events.splice(i, 1); // Remove the calendar
				}
			}

		} else if (state === true) { // Turn on a calendar

			for (var i = 0; i < this.all_events.length; i++) {
				if (this.all_events[i].calendar_title === calendar) {
					this.events.push(this.all_events[i]);
				}
			}

		}

		// Update calendar
		this.$el.find('#scheduling-new-event-calendar').fullCalendar('removeEvents');
		for (var j = 0; j < this.events.length; j++) {
			this.$el.find('#scheduling-new-event-calendar').fullCalendar('addEventSource', this.events[j]);
		}

	}

});

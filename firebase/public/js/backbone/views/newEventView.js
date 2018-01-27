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

		app.iframe.request("createEvent", json).then(function(response) {
			toastr.success("Google calendar event created!");
			proxy(response);
		}, function(error) {
			toastr.error(error);
		});

	},
	create_event: function(json) {

		var object = JSON.parse(json);
		console.log(json);
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

	}

});

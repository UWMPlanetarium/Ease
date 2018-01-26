/*
	Check to make sure this is the most recent version on git branches
	
	EventDetailView -> View
	Template -> #event-detail-view
	Methods:
		initialize | Process
			1. Add listener for all changes to the event and group model, route to render function
		load | Process
			1. Check if the event.invoiceSent isn't true or undefined. Yes, create checkbox for user
			2. Check if the event.invoiceSent is true. Yes, update status with Invoice Sent! text
			3. Check if the event.invoiceFiled isn't true or undefined. Yes, create checkbox for user
			4. Check if the event.invoiceFiled is true. Yes, update status with Invoice Filed! text
			5. Check if the event.invoice_url isn't undefined. Yes, add button to generate an invoice
			6. On timeout, show modal. (This is necessary to make sure element is rendered before showing modal)
		change_status | Process
			1. Get the class of the click
				1. If invoice-sent, update model to invoiceSent = true
				2. If invoice-filed, update model to invoiceFiled = true
		create_invoice | Process
			1. Notify user of process
			2. Create custom JSON object with necessary information for invoice
			3. Send to google apps script with callback Helper.load_invoice
		view_invoice | Process
			1. Open a new tab and redirect url to event.invoice_url
		edit_group | Process
			1. Find the div.static.group and hide via css display none
			2. Find the div.edit.group and show via css display block
			3. Create a save button out of the edit button
		save_group | Process
			1. Get the information from the form
			2. Save to data model -> is instantly updated with firebase
			3. Find the div.static.group and show via css display block
			4. Find the div.edit.group and hide vis css display none
			5. Change save button to edit button
		edit_event | Process
			1. Find the div.static.event and hide via css display none
			2. Find the div.edit.event and show via css display block
			3. Change edit button to save button
		save_event | Process
			1. Get information from form
			2. Create calEvent object via EventModel.createCalendarEvent keeping it's event id
			3. Create special object for updating google calendar, convert to JSON
			4. Send data to google apps script, with Helper.update_event as callback
			5. Set data to data model -> is instantly updated wth firebase
			6. Find div.static.event and show via css display block
			7. Find div.edit.event and hide via css display none
			8. Change save button to edit button
		delete_event | Process
			1. Confirm deletion with user
				1. Yes, remove model from eventList, report to user, hide modal
				2. No, make a joke
		view_all_events | Process
			1. Change button from view all events to hide all events
			2. Get all of the events owned by the group
			3. Turn them into a new EventAuxView, render to container
		hide_all_events | Process
			1. Change button text from hide all events to view all events
			2. Remove all extra events
		show_presented | Process
			1. Set the attributes finished to true on the event model
			2. Inform the user to check the total number of people field
			3. Run edit_event for user to change any data before updating the total attendance
*/
app.EventDetailView = Backbone.View.extend({

	template: _.template($('#event-detail-view').html()),
	initialize: function() {
		this.listenTo(this.model.event, "change", this.render);
		this.listenTo(this.model.group, "change", this.render);
	},
	render: function() {
		this.$el.html(this.template({event:this.model.event.attributes,group:this.model.group.attributes}));
		this.load();
		return this; // chained commands
	},
	load: function() {

		// Create invoice status checkboxes
		if (this.model.event.attributes.invoiceSent !== true || this.model.event.attributes.invoiceSent === undefined) {
			this.$el.find('.invoice_status').append("Invoice Sent: <input type='checkbox' class='invoice-sent' />&nbsp;&nbsp;&nbsp;");
		} else if (this.model.event.attributes.invoiceSent === true) {
			this.$el.find('.invoice_status').append("Invoice Sent! &nbsp;&nbsp;&nbsp;");
		}
		if (this.model.event.attributes.invoiceFiled !== true || this.model.event.attributes.invoiceFiled === undefined) {
			this.$el.find('.invoice_status').append("Invoice Filed: <input type='checkbox' class='invoice-filed' />");
		} else if (this.model.event.attributes.invoiceFiled === true) {
			this.$el.find('.invoice_status').append("Invoice Filed!");
		}

		// Check invoice creation status
		if (this.model.event.attributes.invoice_url !== undefined) {
			this.$el.find('.event-invoice').addClass('event-view-invoice').removeClass('event-invoice').html("View Invoice").parent().append(" <button class='btn btn-warning generate-new-invoice' role='button'>Generate new Invoice</button>");
		}

		setTimeout(function() {
			$('#modals .modal').modal('show');
		}, 10);

	},
	events: {
		'click .event-view': 'event_view',
		'change input:checkbox': 'change_status',
		'click .event-invoice': 'create_invoice',
		'click .event-view-invoice': 'view_invoice',
		'click .generate-new-invoice': 'create_invoice',
		'click .edit-group': 'edit_group',
		'click .save-group': 'save_group',
		'click .edit-event': 'edit_event',
		'click .save-event': 'save_event',
		'click .delete-event': 'delete_event',
		'click .view-all-events': 'view_all_events',
		'click .hide-all-events': 'hide_all_events',
		'click .event-presented': 'show_presented'
	},
	change_status: function(e) {

		var element = $(e.currentTarget).attr('class');

		if (element === 'invoice-sent') {
			this.model.event.set({
				invoiceSent: true
			});
		} else if (element === 'invoice-filed') {
			this.model.event.set({
				invoiceFiled: true
			});
		}

	},
	create_invoice: function() {

		// Alert user
		toastr.info("Creating invoice...");

		// Create the invoice_object
		var group = this.model.group.attributes;
		var event = this.model.event.attributes;
		var invoice_object = {
			id: event._id,
			name: group.groupName,
			calEvent: event.calEvent.string,
			group: group.groupGroup,
			workPhone: group.workPhone,
			cellPhone: group.cellPhone,
			activity: event.activity,
			show: event.show,
			price: event.price,
			numOfPeople: event.numOfPeople,
			email: group.email,
			grade: group.grade
		};

		// Create json to send to server
		var json = JSON.stringify(invoice_object);

		// Send data to server
		google.script.run.withSuccessHandler(Helper.load_invoice)
			.createInvoice(json);

	},
	view_invoice: function() {

		window.open(this.model.event.attributes.invoice_url, '_blank');

	},
	edit_group: function() {

		// Set edit row visible
		this.$el.find('div.static.group').css('display', 'none');
		this.$el.find('div.edit.group').css('display', 'block');

		// Change edit button to save
		this.$el.find('.edit-group').removeClass('edit-group').removeClass('btn-info').addClass('btn-success').addClass('save-group').html("<em class='fa fa-floppy-o'>&nbsp;</em> Save");

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

		// Set to model
		this.model.group.set({
			groupName: groupName,
			groupGroup: groupGroup,
			groupType: groupType,
			grade: grade,
			email: email,
			cellPhone: cellPhone,
			workPhone: workPhone
		});

		// Set static row visible
		this.$el.find('div.static.group').css('display', 'block');
		this.$el.find('div.edit.group').css('display', 'none');

		// Change save button to edit
		this.$el.find('.save-group').removeClass('save-group').removeClass('btn-success').addClass('btn-info').addClass('edit-group').html("<em class='fa fa-pencil'>&nbsp;</em> Edit");

	},
	edit_event: function() {

		// Set edit row visible
		this.$el.find('div.static.event').css('display', 'none');
		this.$el.find('div.edit.event').css('display', 'block');

		// Change edit button to save
		this.$el.find('.edit-event').removeClass('edit-event').removeClass('btn-info').addClass('btn-success').addClass('save-event').html("<em class='fa fa-floppy-o'>&nbsp;</em> Save");

	},
	save_event: function() {

		// Get variables
		var date = this.$el.find('input.date').val();
		var startTime = this.$el.find('input.startTime').val();
		var endTime = this.$el.find('input.endTime').val();
		var show = this.$el.find('input.show').val();
		var activity = this.$el.find('input.activity').val();
		var presenter = this.$el.find('input.presenter').val();
		var price = this.$el.find('input.price').val();
		var numOfPeople = this.$el.find('input.numOfPeople').val();

		// Get cal event
		var calEvent = this.model.event.createCalendarEvent(date, startTime, endTime, {keepEventId: true});

		// Create object to change google event
		var object = {
			new_start: moment(date + ' ' + startTime).format(),
			new_end: moment(date + ' ' + endTime).format(),
			start: this.model.event.attributes.calEvent.calStart,
			end: this.model.event.attributes.calEvent.calEnd,
			event_id: this.model.event.attributes.calEvent.eventID,
			last_edited_by: User.attributes._id
		};
		var json = JSON.stringify(object);
		google.script.run.withSuccessHandler(Helper.updateEvent)
			.editEvent(json);

		// Set to model
		this.model.event.set({
			calEvent: calEvent,
			show: show,
			activity: activity,
			presenter: presenter,
			price: price,
			numOfPeople: numOfPeople
		});

		// Set static row visible
		this.$el.find('div.static.event').css('display', 'block');
		this.$el.find('div.edit.event').css('display', 'none');	
	
		// Change save button to edit
		this.$el.find('.save-event').removeClass('save-event').removeClass('btn-success').addClass('btn-info').addClass('edit-event').html("<em class='fa fa-pencil'>&nbsp;</em> Edit");			

	},
	delete_event: function() {

		var confirm = window.confirm("Really delete this event?");

		if (confirm === true) {

			app.eventList.remove(this.model.event);
			toastr.success("Event deleted");
			$('#modals .modal').modal('hide');

		} else {

			toastr.info("Event not deleted... Phew!");

		}

	},
	view_all_events: function() {

		// Change button text
		this.$el.find('.view-all-events').removeClass('view-all-events').addClass('hide-all-events').html("<em class='fa fa-minus'>&nbsp;</em> Hide all events");

		// Get all events from this group
		var events = app.eventList.where({groupID: this.model.group.attributes._id});
		for (var i = 0; i < events.length; i++) {

			if (events[i].attributes._id === this.model.event.attributes._id) {
				// Do nothing
			} else {
				var view = new app.EventAuxView({model: events[i]});
				this.$el.find('.aux-events-land').append(view.render().el);
			}

		}

	},
	hide_all_events: function() {

		// Change button text
		this.$el.find('.hide-all-events').removeClass('hide-all-events').addClass('view-all-events').html("<em class='fa fa-calendar'>&nbsp;</em> View all events");
		this.$el.find('.aux-events-land').html(' ');

	},
	show_presented: function() {

		this.model.event.set({
			finished: true
		});

		toastr.info('Please double check the Number of People field.');
		this.edit_event();

	}

});

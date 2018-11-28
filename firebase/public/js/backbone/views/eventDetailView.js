/*
	Check to make sure this is the most recent version on git branches
	
	EventDetailView -> View
	Template -> #event-detail-view
	Methods:
		initialize | Process
      1. Add listener for all changes to the event and group model, route to render function. Note: Only group is necessary to pass in. 
         Passing in an event forces the auxilary view to only display that event. If this.model.group == null, ALL events for the group are displayed.
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
    this.listenTo(Backbone, 'appendEvent', function (newEvent) {
      this.append_event(newEvent);
    }, this);
    this.listenTo(Backbone, 'create_new_event', function () {
      this.create_new_event();
    }, this);
	},
	render: function() {
		this.$el.html(this.template({group:this.model.group.attributes}));
		this.load();
		return this; // chained commands
	},
	load: function() {
    this.newEventView = new app.NewEventForm({model: {event: null, group: this.model.group}});
    this.listenTo(this.newEventView, 'appendEvent', this.append_event);
    this.listenTo(this.newEventView, 'create_new_event', this.create_new_event);
    this.$el.find('.new-event-form-landing').append(this.newEventView.render().el);

    if (this.model.event !== null && this.model.event !== undefined) {
      this.view_primary_event(); // This loads the intended event at the top of the list of events. Typically happens when event is selected on scheduling dashboard or event views
    } else {
      var events = app.eventList.where({groupID: this.model.group.attributes._id});
      if (events.length !== 0) {
        this.model.event = events[0];
        this.view_primary_event();
      }
      // this.view_all_events();
    }

		setTimeout(function() {
			$('#modals .modal').modal('show');
		}, 10);

	},
	events: {
		'click .edit-group': 'edit_group',
    'click .save-group': 'save_group',
    'click .view-all-events': 'view_all_events',
    'click .hide-all-events': 'hide_all_events',
    'click .create-new-event': 'create_new_event',
    'input .date': 'selectDateDisableToggle',
    'input .startTime': 'selectDateDisableToggle',
    'input .endTime': 'selectDateDisableToggle',
    'click .select-date-click': 'select_date_click',
    'click .confirm-event': 'confirm_event',
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
		var email = this.$el.find('input.email').val();
		var cellPhone = this.$el.find('input.cellPhone').val();
		var workPhone = this.$el.find('input.workPhone').val();

		// Set to model
		this.model.group.set({
			groupName: groupName,
			groupGroup: groupGroup,
			groupType: groupType,
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
  view_primary_event: function() {
    var events = app.eventList.where({groupID: this.model.group.attributes._id});
    var mainEvent = events[0];
    for (var i = 0; i < events.length; ++i) {
      if (events[i].attributes._id == this.model.event.attributes._id) {
        mainEvent = events[i];
        break;
      }
    }

    var view = new app.EventAuxView({model: {event: mainEvent, group: this.model.group}});
    this.$el.find('.aux-events-landing').append(view.render().el);
  },
  append_event: function(event) {
    var view = new app.EventAuxView({model: {event: event, group: this.model.group}});
    this.model.event = event;
    this.hide_all_events();
  },
	view_all_events: function() {

		// Change button text
		this.$el.find('.view-all-events').removeClass('view-all-events').addClass('hide-all-events').html("<em class='fa fa-minus'>&nbsp;</em> Hide all events");

    // TODO: Sort events chronologically with upcoming towards top
		// Get all events from this group
    var events = app.eventList.where({groupID: this.model.group.attributes._id});
    this.$el.find('.aux-events-landing').html(' ');
    if (this.model.event !== undefined) {
      var view = new app.EventAuxView({model: {event: this.model.event, group: this.model.group}});
      this.$el.find('.aux-events-landing').append(view.render().el);
    }
    if (events.length !== 0) { // Only add events to auxilary view if there are events associated with group
      for (var i = 0; i < events.length; i++) {
        if (this.model.event !== undefined && events[i].attributes._id == this.model.event.attributes._id) continue; // Skips displaying this.model.event if displayed earlier
        var view = new app.EventAuxView({model: {event: events[i], group: this.model.group}});
        this.$el.find('.aux-events-landing').append(view.render().el);
      }
    }
	},
	hide_all_events: function() {

		// Change button text
		this.$el.find('.hide-all-events').removeClass('hide-all-events').addClass('view-all-events').html("<em class='fa fa-calendar'>&nbsp;</em> View all events");
		this.$el.find('.aux-events-landing').html(' ');
    var events = app.eventList.where({groupID: this.model.group.attributes._id});
    if (this.model.event !== null && this.model.event !== undefined) { // If a specific event was selected earlier, only display that event
      var view = new app.EventAuxView({model: {event: this.model.event, group: this.model.group}});
      this.$el.find('.aux-events-landing').append(view.render().el);
    } else if (events.length !== 0) { // Only add events to auxilary view if there are events associated with group
      var view = new app.EventAuxView({model: {event: events[0], group: this.model.group}});
      this.$el.find('.aux-events-landing').append(view.render().el);
    }
  },
  create_new_event: function() {
    if (this.$el.find('.new-event-form-landing').css('display') == 'none') {
      this.$el.find('.new-event-form-landing').css('display', 'block');
      this.$el.find('.plus-minus').removeClass('fa-plus').addClass('fa-minus');
    } else {
      this.$el.find('.new-event-form-landing').css('display', 'none');
      this.$el.find('.plus-minus').removeClass('fa-minus').addClass('fa-plus');
    }
  }
});

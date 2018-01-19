/*
	Check git branches that this is the most recent version
	
	EventAuxView -> View
	Template -> #event-aux-view
	Methods:
		initalize | Process
			1. Add listener to all changes to this.model, route to render function
		events | Explanation
			Backbone.View must have an object returned for it's events attributes. However, this view uses custom id's in html. So I created an object that grabs the appropriate id's and creates the correctly formatted object, then returns it to backbone.
		edit_events | Process
			1. Find the div.static.event element, hide with css display none
			2. Find the div.edit.event element, show with display block
			3. Change the edit button to a save button
		save_event | Process
			1. Get all of the variables from the inputs
			2. Create a calEvent object with EventModel.createCalendarEvent, keeping it's unique event ID
			3. Create a custom JSON object to send data to google apps scripts
			4. Send data to google apps script to update the event, Helper.updateEvent as callback
			5. Set the new data to the model -> is instantly updated on firebase
			6. Find div.static.event element, show with display block
			7. Find div.edit.event element, hide with css display hide
			8. Change save button to edit button
		delete_event | Process
			1. Get cofirmation from user for deleting event
				1. Yes, Remove the model from the eventList, inform user, close modal
				2. No, Make a joke
*/
app.EventAuxView = Backbone.View.extend({

	template: _.template($('#event-aux-view').html()),
	initialize: function() {
		this.listenTo(this.model, "change", this.render);
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this; // chained commands
	},
	events: function(){
		var _events = {};
		_events['click .edit-event' + this.model.attributes._id] = 'edit_event';
		_events['click .save-event' + this.model.attributes._id] = 'save_event';
		_events['click .event-invoice' + this.model.attributes._id] = 'create_invoice';
		_events['click .event-view-invoice' + this.model.attributes._id] = 'view_invoice';
		return _events;
	},
	edit_event: function() {

		// Set edit row visible
		this.$el.find('div.static.event').css('display', 'none');
		this.$el.find('div.edit.event').css('display', 'block');

		// Change edit button to save
		this.$el.find('.edit-event' + this.model.attributes._id).removeClass('edit-event').removeClass('btn-info').addClass('btn-success').addClass('save-event' + this.model.attributes._id).html("<em class='fa fa-floppy-o'>&nbsp;</em> Save");

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
		var calEvent = this.model.createCalendarEvent(date, startTime, endTime, {keepEventId: true});

		// Create object to change google event
		var object = {
			new_start: moment(date + ' ' + startTime).format(),
			new_end: moment(date + ' ' + endTime).format(),
			start: this.model.attributes.calEvent.calStart,
			end: this.model.attributes.calEvent.calEnd,
			event_id: this.model.attributes.calEvent.eventID
		};
		var json = JSON.stringify(object);
		
		/* Needs to change to google functions
		google.script.run.withSuccessHandler(Helper.updateEvent)
			.editEvent(json);
		*/

		// Set to model
		this.model.set({
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
		this.$el.find('.save-event' + this.model.attributes._id).removeClass('save-event').removeClass('btn-success').addClass('btn-info').addClass('edit-event' + this.model.attributes._id).html("<em class='fa fa-pencil'>&nbsp;</em> Edit");			

	},
	delete_event: function() {

		var confirm = window.confirm("Really delete this event?");

		if (confirm === true) {

			app.eventList.remove(this.model);
			toastr.success("Event deleted");
			$('#modals .modal').modal('hide');

		} else {

			toastr.info("Event not deleted... Phew!");

		}

	}

});

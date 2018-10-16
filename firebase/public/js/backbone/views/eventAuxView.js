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
    this.listenTo(this.model.event, "change", this.render);
	},
	render: function() {
    this.$el.html(this.template({event: this.model.event.attributes}));
    this.load();
		return this; // chained commands
  },
  load: function() {

      this.eventForm = new app.NewEventForm({model: {event: this.model.event, group: this.model.group}});
      this.listenTo(this.eventForm, 'duplicateEvent', this.duplicate_event);
      this.$el.find('.new_event_form_landing').append(this.eventForm.render().el);
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
  },
  events: {
    'click .event-view': 'event_view',
		'change input:checkbox': 'change_status',
		'click .event-invoice': 'create_invoice',
		'click .event-view-invoice': 'view_invoice',
    'click .edit-event': 'edit_event',
		'click .save-event': 'save_event',
		'click .delete-event': 'delete_event',
		'click .event-presented': 'show_presented',
    'click .event-payment': 'add_payment',
    'click .duplicate-event': 'duplicate_event',
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
			eventID: this.model.event.attributes.calEvent.eventID
		};
		var json = JSON.stringify(object);
		
		app.iframe.request("editEvent", json).then(function(response) {
			toastr.success("Event updated");
		}, function(error) {
			toastr.error("Event wasn't updated successfully on google calendar.");
		});

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

			var obj = {
				start: this.model.event.attributes.calEvent.calStart,
				end: this.model.event.attributes.calEvent.calEnd,
				eventID: this.model.event.attributes.calEvent.eventID
			}
			var json = JSON.stringify(obj);

			app.iframe.request("removeEvent", json).then(function(response) {
				// Do nothing
			}, function(error) {
				toastr.error("Not successfully deleted from google calendar. Please delete it manually.")
			});
			app.eventList.remove(this.model.event);
			toastr.success("Event deleted");
			$('#modals .modal').modal('hide');

		} else {

			toastr.info("Event not deleted... Phew!");

		}

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

		var proxy = this;

		// Make the request
		app.iframe.request("createInvoice", json).then(function(response) {
			toastr.success("Created!");
			window.open(response.url, "_blank");
			proxy.model.event.set({
				invoice_url: response.url
			});
		}, function(error) {
			toastr.error(error);
		});

	},
	view_invoice: function() {

		window.open(this.model.event.attributes.invoice_url, '_blank');

  },
  show_presented: function() {

		this.model.event.set({
			finished: true
		});

		toastr.info('Please double check the Number of People field.');
		this.edit_event();

  },
  add_payment: function() {

		// Create a new add_payment modal screen with the event / group details
		var view = new app.TransactionView({model: {event: this.model.event, group: this.model.group}});
		$('#modals').append(view.render().el);
		this.remove();

  },
  duplicate_event: function() {
    if (this.$el.find('.new_event_form_landing').css('display') == 'none') {
      this.$el.find('.new_event_form_landing').css('display', 'block');
    } else {
      this.$el.find('.new_event_form_landing').css('display', 'none');
    }
  },

});

/*
	Check to make sure this is the most recent version on git branches
	
	EventListView -> View
	template -> #event-list-item-view
	Methods:
		initialize | Process
			1. Add listener for all events on the the event and group models, route to the render function
		load | Process
			1. Check to see if the invoice_url isn't underined, means an invoice has been generated
				1. YES
				2. Check if invoiceSent attribute isn't true or undefined, add an invoice sent checkbox for user
				3. Check if invoiceSent is true, then add status of Invoice Sent! text
				4. Check if invoiceFiled attribute isn't true or undefined, add an invoice filed checkbox for user
				5. Check if invoiceFiled  is true, add the status of Invoice Filed! text
				6. Create button to Show Invoice
		change_status | Same as eventDetailView
		create_invoice | Same as eventDetailView
		view_invoice | Same as eventDetailView
		event_view | Process
			1. Create a new eventDetailView, render to the #modals element
		show_presented | Same as eventDetailView 
*/
app.EventListView = Backbone.View.extend({

	template: _.template($('#event-list-item-view').html()),
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

		// Check invoice status
		if (this.model.event.attributes.invoice_url !== undefined) { // Invoice url exists

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

			// Set primary button
			this.$el.find('.event-invoice').addClass('event-view-invoice').removeClass('event-invoice').html('View Invoice');

		}

	},
	events: {
		'click .event-view': 'event_view',
		'change input:checkbox': 'change_status',
		'click .event-invoice': 'create_invoice',
		'click .event-view-invoice': 'view_invoice',
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
			numOfPeople: event.numOfPeople, // add to model
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
	event_view: function() {

		var view = new app.EventDetailView({model: {event: this.model.event, group: this.model.group}});
		$('#modals').html(view.render().el);

	},
	show_presented: function() {

		this.model.event.set({
			finished: true
		});

		var view = new app.EventDetailView({model: {event: this.model.event, group: this.model.group}});
		$('#modals').html(view.render().el);
		toastr.info('Please double check the Number of People field.');
		view.edit_event();

	}

});

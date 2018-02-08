// Add payment view

app.AddPaymentView = Backbone.View.extend({

	template: _.template($('#addpayment-template').html()),
	initialize: function() {
		// Add watchers
	},
	render: function() {
		this.$el.html(this.template());
		this.load();
		return this;
	},
	events: {
		'click #savePayment': 'savePayment'
	},
	load: function() {

		// Check if there is a transaction already associated with this event
		var transaction = app.transactionList.where({eventID: this.model.event.attributes._id});
		if (transaction.length === 0) { // No transaction exists, create on
			this.transaction = app.transactionList.create({
				_id: app.transactionList.getNextID(),
				eventID: this.model.event.attributes._id,
				groupID: this.model.group.attributes._id,
				date: new Date().toISOString(),
				total: this.model.event.attributes.price
			});
			toastr.success("New transaction created!");
		} else {
			this.transaction = transaction[0];
			toastr.success("Transaction already created.");
		}

		// Set the current date
		var date = new Date().toISOString().substring(0, 10);
		this.$el.find('#payment_date').val(date);

		// Set probable payment amount
		this.$el.find('#payment_amount').val(this.model.event.attributes.price);

	},
	savePayment: function() {

		// Scoop the data
		var payment = {
			date: this.$el.find('#payment_date').val(),
			amount: this.$el.find('#payment_amount').val(),
			type: this.$el.find('#payment_type').val()
		};

		

		toastr.success("Payment added");

	}

});
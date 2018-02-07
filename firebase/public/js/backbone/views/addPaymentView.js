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
	load: function() {

		// Set the current date
		var date = new Date().toISOString();
		console.log(date);
		this.$el.find('#payment_date').val(date);
		console.log(this.$el.find('#payment.date').val());

	}

});
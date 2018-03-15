app.CreateDepositView = Backbone.View.extend({

	template: _.template($('#create-deposit-view').html()),
	initialize: function() {
	},
	render: function() {
		this.$el.html(this.template());
		this.load();
		return this; // chained commands
	},
	events: {
		'click .create-deposit': 'createDeposit'
	},
	load: function() {

		setTimeout(function() {
			$('#modals .modal').modal('show');
		}, 50);

	},
	createDeposit: function() {

		// Scoop the period
		var start = this.$el.find('#deposit_start').val();
		var end = this.$el.find('#deposit_end').val();

		app.transactionList.createDeposit(start, end);

		toastr.success("Creating Deposit, please wait!");

	}
});

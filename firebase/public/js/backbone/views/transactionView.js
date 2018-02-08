// Transaction

app.TransactionView = Backbone.View.extend({

	template: _.template($('#transaction-view').html()),
	initialize: function() {
	},
	render: function() {
		this.$el.html(this.template({event: this.model.event.attributes, group: this.model.group.attributes}));
		this.load();
		return this;
	},
	events: {
		'click #savePayment': 'savePayment'
	},
	load: function() {

		// Check if transaction exists, otherwise create a new entry
		console.log(this.model);
		var transaction = app.transactionList.where({eventID: this.model.event.attributes._id});
		if (transaction.length === 0) { // Doesn't exist
			this.model.transaction = app.transactionList.create({
				_id: app.transactionList.getNextID(),
				date: new Date().toISOString(),
				eventID: this.model.event.attributes._id,
				groupID: this.model.group.attributes._id,
				total: this.model.event.attributes.price,
				payments: []
			});
		} else { // Exists
			this.model.transaction = transaction[0];
			if (this.model.transaction.attributes.payments !== undefined) { // Need to write out html for the payments on this transaction
				this.addPayments();
			}
			this.model.transaction.on("all", this.render, this);
		}

		// Set the current date
		var date = new Date(this.model.event.attributes.calEvent.date.iso).toISOString().substring(0, 10);
		this.$el.find('#payment_date').val(date);

		// Set probable payment amount
		this.$el.find('#payment_amount').val(this.model.event.attributes.price);

		setTimeout(function() {
			$('#modals .modal').modal('show');
		}, 25);

	},
	addPayments: function() {
		console.log(this);
		this.$el.find('#payment_land').html(' ');
		var trans = this.model.transaction.attributes;
		for (var payment in trans.payments) {
			var html = `<div class='row' style='margin-bottom: 10px'>
				<div class='col-md-4'>
					Date: <b>` + new Date(trans.payments[payment].date).toLocaleDateString() + `</b>
				</div>
				<div class='col-md-4'>
					Amount: <b>` + trans.payments[payment].amount + ` </b>
				</div>
				<div class='col-md-4'>
					Type: <b>` + trans.payments[payment].type + `</b>
				</div>
			</div>`;
			this.$el.find('#payments_land').prepend(html);
		}
	},
	savePayment: function() {

		// Scoop the data
		var payment = {
			date: this.$el.find('#payment_date').val(),
			amount: this.$el.find('#payment_amount').val(),
			type: this.$el.find('#payment_type').val()
		};

		var payments = this.model.transaction.attributes.payments;
		payments.push(payment);
		this.model.transaction.set({
			payments: payments
		});
		toastr.success('Payment added');

	}
});
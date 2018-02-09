	// Transaction

app.TransactionView = Backbone.View.extend({

	template: _.template($('#transaction-view').html()),
	initialize: function() {
	
	},
	render: function() {
		this.$el.html(this.template({event:this.model.event.attributes, group:this.model.group.attributes}));
		var proxy = this;
		setTimeout(function() {
			proxy.load();
		});
		return this; // chained commands
	},
	events: {
		'click #savePayment': 'savePayment',
		'click .delete-payment': 'deletePayment',
		'click .remove-modal': 'removeModal'
	},
	load: function() {

		// Check if transaction exists, otherwise create one
		var transactions = app.transactionList.where({eventID: this.model.event.attributes._id});
		if (transactions.length === 0) {
			var id = app.transactionList.getNextID();
			app.transactionList.create({
				_id: id,
				eventID: this.model.event.attributes._id,
				groupID: this.model.group.attributes._id,
				total: this.model.event.attributes.price,
				date: this.model.event.attributes.calEvent.date.iso,
				payments: []
			});
			this.model.transaction = app.transactionList.where({_id: id})[0];
		} else { // Exists
			this.model.transaction = transactions[0];
			// Display payments
			this.displayPayments();
		}
		this.model.transaction.on('change', this.render, this);		
	
		// Set date probable price
		this.$el.find('#payment_date').val(this.model.event.attributes.calEvent.date.iso);
		this.$el.find('#payment_amount').val(this.model.event.attributes.price);
	
		setTimeout(function() {
			$('#modals .modal').modal('show');
		}, 50);
	
	},
	displayPayments: function() {
	
		console.log(this.model.transaction);

		this.$el.find('#payments_land').html(' ');
		if (this.model.transaction.attributes.payments !== null) {
			for (var payment in this.model.transaction.attributes.payments) {
				console.log(payment);
				var html = `<div class='row' style='margin-bottom: 10px'>
					<div class='col-md-3'>
						Date: <b>` + this.model.transaction.attributes.payments[payment].date + `</b>
					</div>
					<div class='col-md-3'>
						Amount: <b>$` + this.model.transaction.attributes.payments[payment].amount + ` </b>
					</div>
					<div class='col-md-3'>
						Type: <b>` + this.model.transaction.attributes.payments[payment].type + `</b>
					</div>
					<div class='col-md-3'>
						<button class='btn btn-danger delete-payment' array-item='` + payment +`'>Delete</button>
					</div>
				</div>`;
				this.$el.find('#payments_land').prepend(html);	
			}
		
		}
	
	},
	savePayment: function() {
		
		// Scoop the data
		var payment = {
			date: this.$el.find('#payment_date').val(),
			amount: this.$el.find('#payment_amount').val(),
			type: this.$el.find('#payment_type').val()
		}
		var payments = this.model.transaction.attributes.payments;
		if (payments === null || payments === undefined) {
			payments = [];
		}
		payments.push(payment);
		this.model.transaction.set({
			dateEdited: new Date().toISOString(),
			payments: payments
		});
		toastr.success("Payment added!");
		
	},
	deletePayment: function(e) {
	
		var index = $(e.currentTarget).attr('array-item');
		var payments = this.model.transaction.attributes.payments;
		payments.splice(index, 1);
		this.model.transaction.set({
			dateEdited: new Date().toISOString(),
			payments: payments
		});
		toastr.success("Payment deleted");
	
	},
	removeModal: function() {
		this.remove();
	}

});












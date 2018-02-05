// Add payment view

app.AddPaymentView = Backbone.View.extend({

	template: _.template($('#addpayment-template').html()),
	initialize: function() {
		// Add watchers
	},
	render: function() {
		this.$el.html(this.template({event:this.model.event.attributes,group:this.model.group.attributes}));
		this.load();
		return this;
	},
	load: function() {

	}

});
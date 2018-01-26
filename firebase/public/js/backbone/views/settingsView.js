app.SettingsView = Backbone.View.extend({

	template: _.template($('#settings-view-template').html()),
	render: function() {
		this.$el.html(this.template());
		this.load();
		return this;
	},
	load: function() {

		var view = new app.UserView({model: User});
		this.$el.find('.panel-body').html(view.render().el);

	}

});

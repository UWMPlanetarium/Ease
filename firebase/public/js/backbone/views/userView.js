app.UserView = Backbone.View.extend({

	template: _.template($('#user-view-template').html()),
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	events: {
		'click .change-password': 'change_password',
		'click .add-user': 'add_user'
	},
	change_password: function() {

		var password = prompt("Please enter a new password:");

		if (password !== null && password !== '') {

			var password_2 = prompt("Please confirm new password:");

			if (password_2 === password) {

				User.set({
					password: encrypt(password)
				});
				toastr.success("Password changed!");

			}

		}

	},
	add_user: function() {
    var view = new app.NewUserView();
    $('#modals').html(view.render().el); 
	}

});

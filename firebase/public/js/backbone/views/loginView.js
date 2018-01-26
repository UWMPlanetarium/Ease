/*
	Check to make sure this is the most recent version on the git branches
	
	LoginView -> View
	template -> #login-view
	Methods:
		login | Process
			1. Get the user / password from the form
			2. Find the user from the userList
				1. If found continue, else inform user of incorrect username
				2. Decrypt the password located in the users.password attribute
				3. Check to make sure they equal across
					1. Else inform the user of an incorect password
				4. Set User global to the user found
				5. Welcome user with name
				6. Clear .bdy element
				7. Create new sidebar and dashboard views
*/
app.LoginView = Backbone.View.extend({

	template: _.template($('#login-view').html()),
	render: function() {
		this.$el.html(this.template());
		return this;
	},
	events: {
		'click .login-submit': 'login',
		'keyup': 'test_key'
	},
	login: function() {

		var username = this.$el.find('input.username').val();
		var password = this.$el.find('input.password').val();

		var users = app.userList.where({username: username});
		if (users.length !== 0) {

			for (var i = 0; i < users.length; i++) {

				if (password === decrypt(users[i].attributes.password)) {

					User = users[i];

					toastr.success("Login successful! Welcome " + username);

					$('#body').html(' ');

					if (User.attributes.authorization === true) { // Is an authorized user

						var sidebar = new app.AuthorizedSidebarView();
						$('#sidebar_landing').append(sidebar.render().el);
						//$('.profile .email').html(user_object.email);

						app.appView.dashboard_view();

					}					

				} else {

					toastr.error("Incorrect Password");

				}

			}

		} else {

			toastr.error("Username not found.");

		}

	},
	test_key: function(e) {

		if (e.keyCode === 13) { // Is enter key

			this.login();

		}

	}

});

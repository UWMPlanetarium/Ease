app.NewUserView = Backbone.View.extend({

	template: _.template($('#new-user-view-template').html()),
	render: function() {
		this.$el.html(this.template());
		this.load();
		return this; // chained commands
  },
  
	load: function() {

		setTimeout(function() {
			$('#modals .modal').modal('show');
		}, 10);

  },
  
	events: {
		'click .save-user': 'save_user',
  },
  
  save_user: function() {
    var username = this.$el.find('input.newUsername').val();
    var email = this.$el.find('input.newEmail').val();
    var password = this.$el.find('input.newPassword').val();

    if (password == null || password == '') {
      toastr.error("Please enter a valid password");
      return;
    } else if (username == null || username == '') {
      toastr.error("Please enter a valid username");
      return;
    } else if (email == null || email == '') { 
      toastr.error("Please enter a valid email");
      return;
    }

    var user = {
      _id: app.userList.getNextId(),
      authorization: true,
      password: encrypt(password),
      email: email,
      username: username
    }

    app.userList.add(user);

    toastr.success("User successfully created!");

    this.$el.find('input.newUsername').val("");
    this.$el.find('input.newEmail').val("");
    this.$el.find('input.newPassword').val("");

  }

});
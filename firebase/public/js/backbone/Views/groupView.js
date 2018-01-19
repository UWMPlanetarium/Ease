/*
	Check to make sure this is the most recent version on git branches
	
	GroupView -> View
	template -> #group-view-template
	Methods:
		initialize | Process
			1. Add listener for all changes to the groupList collection, route to load function
		load | Process
			1. Clear the .group-landing element
			2. Iterate through all groups, run render_group function with group
		search | Process
			1. Get the value from the search input field
			2. Find the groups from the search using the Helper.collecionContains function with params for the groupName, groupGroup, and email
			3. Clear the .group_landing element
			4. Iterate through the groups, push to render_group function
		render_group | Process
			1. Create a new GroupListView view
			2. Render view to .group_landing element
*/
app.GroupView = Backbone.View.extend({

	template: _.template($("#group-view-template").html()),
	initialize: function() {
		this.listenTo(app.groupList, "all", this.load);
	},
	render: function() {
		this.$el.html(this.template());
		this.load();
		return this; // chained commands
	},
	load: function() {

		this.$el.find('.group-landing').html(' ');
		for (var i = 0; i < app.groupList.length; i++) {

			this.render_group(app.groupList.models[i]);

		}

	},
	events: {
		'keyup .search-val': 'search'
	},
	search: function() {

		var value = this.$el.find('.search-val').val();
		var groups = Helper.collectionContains(app.groupList.models, value, ['groupName', 'groupGroup', 'email']);
		this.$el.find('.group-landing').html(' '); // Clear html
		for (var i = 0; i < groups.length; i++) {
			this.render_group(groups[i]);
		}

	},
	render_group: function(group) {

		var view = new app.GroupListView({model: group});
		this.$el.find('.group-landing').append(view.render().el);

	}

});

/*
	Check to make sure this is the most recent version on git branches
	
	GroupListView -> View
	template -> #group-list-item-view
	Methods:
		initialize | Process
			1. Add listener for all changes to the data model, route to render function
		view_events | Process
			1. Get the first event in the eventList collection for the group
			2. Create a new EventDetailView view
			3. Render view to #modals element
			4. Run view.view_all_events function to show all events from the group
*/
app.GroupListView = Backbone.View.extend({

	template: _.template($('#group-list-item-view').html()),
	initialize: function() {
		this.listenTo(this.model, "change", this.render);
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this; // chained commands
	},
	events: {
		'click .event-view': 'view_events'
	},
	view_events: function() {

		var event = app.eventList.where({groupID: this.model.attributes._id})[0];
		var view = new app.EventDetailView({model:{event:event, group:this.model}});
		$('#modals').html(view.render().el);
		view.view_all_events();

	}

});

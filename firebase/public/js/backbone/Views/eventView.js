/*
	Check to make sure this is the most recent version on git branches
	
	EventView -> View
	template -> #event-view-template
	Methods:
		initialize | Process
			1. Add listener for all changes to the eventList, route to load function
		load | Process
			1. Clear the .events-landing element
			2. Get all of the events, push to addEventListItem function
		addEventListFunction | Process
			1. Find the group for the event
			2. Create a new EventListView view
			3. Render view to element
		create_event | Process
			1. Create a new NewEventView
			2. Render to #modals element
*/
app.EventView = Backbone.View.extend({

	template: _.template($("#event-view-template").html()),
	initialize: function() {
		this.listenTo(app.eventList, "all", this.load);
	},
	render: function() {
		this.$el.html(this.template());
		this.load();
		return this; // chained commands
	},
	load: function() {

		this.$el.find('.events-landing').html(' ');
		// Show all events
		for (var i = 0; i < app.eventList.length; i++) {

			this.addEventListItem(app.eventList.models[i], '.events-landing');

		}

	},
	events: {
		'click .create-event-click': 'create_event'
	},
	addEventListItem: function(event, element) {

		var group = app.groupList.where({_id: event.attributes.groupID});
		var view = new app.EventListView({model: {event: event, group: group[0]}});
		this.$el.find(element).append(view.render().el);

	},
	create_event: function() {

		var view = new app.NewEventView();
		$('#modals').html(view.render().el);

	},

});

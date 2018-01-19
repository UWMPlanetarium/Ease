app.AuthorizedSidebarView = Backbone.View.extend({

	template: _.template($('#authorized_sidebar-template').html()),
	el: "#sidebar_landing",
	render: function() {
		this.$el.html(this.template());
		this.load();
		return this;
	},
	events: {

		'click .dashboard_view': 'dashboard_view',
		'click #scheduling_dashboard_click': 'scheduling_dashboard_click',
		'click #scheduling_events_click': 'event_view',
		'click #scheduling_group_click': 'group_view',
		'click #settings_view': 'settings_view',
		'click #accounting_dashboard_click': 'accounting_dashboard_view'

	},
	load: function() {

		// Set profile information
		this.$el.find('.name').html(User.attributes.username);
		this.$el.find('.email').html(User.attributes.email);

	},
	dashboard_view: function() {
	
		$('.nav').find('.active').removeClass('active');
		$('.dashboard_view').addClass('active');
		app.appView.dashboard_view();

	},
	scheduling_dashboard_click: function() {

		$('.nav').find('.active').removeClass('active');
		$('#scheduling_dashboard_click').addClass('active');
		app.appView.scheduling_dashboard_view();

	},
	event_view: function() {

		$('.nav').find('.active').removeClass('active');
		$('.nav').find('#scheduling_events_click').addClass('active');
		app.appView.event_view();

	},
	group_view: function() {

		$('.nav').find('.active').removeClass('active');
		$('.nav').find('#scheduling_group_click').addClass('active');
		app.appView.group_view();

	},
	settings_view: function() {

		$('.nav').find('.active').removeClass('active');
		$('.nav').find('#settings_view').addClass('active');
		app.appView.settings_view();

	},
	accounting_dashboard_view: function() {

		$('.nav').find('.active').removeClass('active');
		$('.nav').find('#accounting_dashboard_click').addClass('active');
		app.appView.accounting_dashboard_view();

	}

});

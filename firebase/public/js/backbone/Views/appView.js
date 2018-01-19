/*
	Check to make sure this is most recent version on all git branches
	
	AppView -> View (Primary View)
	Template -> None
	Methods:
		initialize | Process
			1. Alert user of loading process, give disclaimer for bad load
			2. Create initial snapshots of collections
		load | Process
			1. Create login view and and render it
		dashboard_view, scheduling_dashboard_view, event_view, group_view, settings_view, accounting_dashboard_view | Process
			1. Clear all primary content with clearContent function
			2. Create appropriate view and render it
		clearContent | Process
			1. Clear everything in #body element  
*/
app.AppView = Backbone.View.extend({

	initialize: function() {

		$('#body').html('Loading... (Please refresh if it not loading)');

		// Create collections
		app.groupList = new app.GroupList();
		app.eventList = new app.EventList();
		app.transactionList = new app.TransactionList();
		app.paymentList = new app.PaymentList();
		app.projectList = new app.ProjectList();
		app.taskList = new app.TaskList();
		app.userList = new app.UserList();

		this.load();

	},
	load: function(json) {

		var login_view = new app.LoginView();
		$('#body').html(login_view.render().el);

	},
	dashboard_view: function() {

		this.clearContent();
		var dashboard = new app.DashboardView();
		$('#body').append(dashboard.render().el);

	},
	scheduling_dashboard_view: function() {

		this.clearContent();
		var scheduling_dashboard = new app.SchedulingDashboardView();
		$('#body').append(scheduling_dashboard.render().el);

	},
	event_view: function() {

		this.clearContent();
		var event_view = new app.EventView();
		$('#body').append(event_view.render().el);

	},
	group_view: function() {

		this.clearContent();
		var group_view = new app.GroupView();
		$('#body').append(group_view.render().el);

	},
	settings_view: function() {

		this.clearContent();
		var settings_view = new app.SettingsView();
		$('#body').append(settings_view.render().el);

	},
	accounting_dashboard_view: function() {

		this.clearContent();
		var accounting_dashboard_view = new app.AccountingDashboard();
		$('#body').append(accounting_dashboard_view.render().el);

	},
	clearContent: function() {
		$('#body').html(' ');
	}

});

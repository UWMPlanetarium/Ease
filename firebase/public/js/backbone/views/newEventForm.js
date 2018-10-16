app.NewEventForm = Backbone.View.extend({

	template: _.template($("#new-event-form").html()),
	initialize: function() {
		this.listenTo(this.model.event, "change", this.render);
	},
	render: function() {
    if (this.model.event !== null) {
      this.$el.html(this.template({event: this.model.event.attributes}));
    } else {
      var blankEvent = new app.Event();
      this.$el.html(this.template({event: blankEvent.attributes}));
    }
    this.load();
		return this; // chained commands
	},
	load: function() {


	},
	events: {
    'input .date': 'selectDateDisableToggle',
    'input .startTime': 'selectDateDisableToggle',
    'input .endTime': 'selectDateDisableToggle',
    'click .select-date-click': 'select_date_click',
    'click .confirm-event': 'confirm_event',
  },

  create_new_event: function() {
    // if(this.$el.find('.select-date').css('display') == 'none' && this.$el.find('.show-details').css('display') == 'block') {
    //   this.$el.find('.show-details').css('display', 'none');
    //   this.$el.find('.date').val("");
    //   this.selectDateDisableToggle();
    // } else if (this.$el.find('.select-date').css('display') == 'block'){
    //   this.$el.find('.select-date').css('display', 'none');
    //   this.$el.find('.date').val("");
    //   this.selectDateDisableToggle();
    // } else {
    //   this.$el.find('.select-date').css('display', 'block');
    // }
  },
  selectDateDisableToggle: function() {
    var date = this.$el.find('input.date').val();
    var startTime = this.$el.find('input.startTime').val();
    var endTime = this.$el.find('input.endTime').val();
    if (startTime > endTime || date == '' || date == null || startTime == '' || startTime == null || endTime == '' || endTime == null) {
      this.$el.find('.select-date-click').attr('disabled', true);
    } else {
      this.$el.find('.select-date-click').removeAttr('disabled');
    }
  },
  select_date_click: function() {
    
    // Get the date / time data
    this.date = this.$el.find('input.date').val();
    this.startTime = this.$el.find('input.startTime').val();
    this.endTime = this.$el.find('input.endTime').val();

    // Calculate difference in time
    var a = moment(this.endTime, 'HH:mm');
    var b = moment(this.startTime, 'HH:mm');
    var hourDiff = a.diff(b, 'hours', true);
    var dayDiff = moment(this.date).isBefore(moment(), "day");

    // Need user confirmation if day is in the past or event duration >= 3 hours
    if (dayDiff && hourDiff >=3) {
      if (confirm("Warning: Selected date is in the past. Are you sure you want to do this?")) {
        if (confirm("Warning: Selected event duration is longer than 3 hours. Please confirm.")) {
          this.show_details();
        }
      }
    } else if (dayDiff) {
      if (confirm("Warning: Selected date is in the past. Are you sure you want to do this?")) {
        this.show_details();
      }
    } else if (hourDiff >= 3) {
      if (confirm("Warning: Selected event duration is longer than 3 hours. Please confirm.")) {
        this.show_details();
      }
    } else {
      // Get show details
		  this.show_details();
    }
  },
  show_details: function() {

		this.$el.find('.select-date').css('display', 'none');
		this.$el.find('.show-details').css('display', 'block');

  },
  confirm_event: function() {

		// Get show details
		var show = this.$el.find('input.showData').val();
		var activity = this.$el.find('input.activity').val();
		var presenter = this.$el.find('input.presenter').val();
		var price = this.$el.find('input.price').val();
    var numOfPeople = this.$el.find('input.numOfPeople').val();
    
    var date = this.$el.find('input.date').val();
    var startTime = this.$el.find('input.startTime').val();
    var endTime = this.$el.find('input.endTime').val();

		// Create model
		var event = {
			groupID: this.model.group.attributes._id,
			_id: app.eventList.getNextID(),
			show: show,
			activity: activity,
			presenter: presenter,
			price: price,
			numOfPeople: numOfPeople,
			created_by: User.attributes._id
		};

    event.calEvent = app.eventList.models[0].createCalendarEvent(date, startTime, endTime);
    
    if (event.calEvent.calStart == 'Invalid date' || event.calEvent.calEnd == 'Invalid date') {
      toastr.error("Error occured creating calendar event. Please check the event on Google Calendar");
    }

		// Alert user
		toastr.info("Creating event");

    var json = JSON.stringify({event_DATA:event, group:this.model.group.attributes});

    var proxy = this.create_event.bind(this);

		app.iframe.request("createEvent", json).then(function(response) {
      toastr.success("Google calendar event created!");
      proxy(response, event);
		}, function(error) {
			toastr.error(error);
		});

  },
  create_event: function(json, event) {

    var object = json;
		if (object.response === true) {

			toastr.success("Created event");
			app.eventList.add(object.event_DATA);
      var event = app.eventList.where({_id:object.event_DATA._id})[0];
      
      if (this.model.event == null) {
        this.$el.find('.show-details').css('display', 'none');
        this.clearAllFields();
        this.selectDateDisableToggle();
        this.$el.find('.select-date').css('display', 'block');
        this.trigger('appendEvent', event);
        this.trigger('create_new_event');
      } else {
        this.$el.find('.show-details').css('display', 'none');
        this.$el.find('.date').val("");
        this.selectDateDisableToggle();
        this.$el.find('.select-date').css('display', 'block');
        this.trigger('appendEvent', event);
        this.trigger('duplicateEvent');
      }
      
		}

  },
  clearAllFields: function() {
    this.$el.find('.date').val("");
    this.$el.find('.startTime').val("");
    this.$el.find('.endTime').val("");
    this.$el.find('.showData').val("");
    this.$el.find('.activity').val("");
    this.$el.find('.presenter').val("");
    this.$el.find('.price').val("");
    this.$el.find('.numOfPeople').val("");
  },
});
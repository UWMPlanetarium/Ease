/*
	I'm not sure this is the most recent version. Check git branches

	AccountingDashboard - View
	Template -> #accounting-dashboard-template
	Methods:
		- Render
		- Load | Process
			1. Build line graph for income by month
			2. Build line graph for total income
			3. Build pie chart for income by transaction type
			4. Build bar chart for income by group type
*/

app.AccountingDashboard = Backbone.View.extend({

	template: _.template($('#accounting-dashboard-template').html()),
	render: function() {
		this.$el.html(this.template());
		this.load();
		return this;
	},
	load: function() {

		setTimeout(function() {

			// Income by month
			var ctx = document.getElementById('chart_month').getContext('2d');
			var chart = new Chart(ctx, {
				  // The type of chart we want to create
				  type: 'line',

				  // The data for our dataset
				  data: {
				      labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
				      datasets: [{
				          label: "Monthly Income",
				          backgroundColor: 'rgb(255, 97, 34)',
				          borderColor: 'rgb(255, 163, 126)',
				          data: [1482, 3189, 3128, 2568, 1911, 2450, 4370, 5544, 1825, 399]
				      }]
				  },

				  // Configuration options go here
				  options: {
					plugins: {
						datalabels: {
							backgroundColor: function(context) {
								return context.dataset.backgroundColor;
							},
							borderRadius: 4,
							color: 'white',
							font: {
								weight: 'bold'
							},
							formatter: Math.round
						}
					},
					scales: {
						yAxes: [{
							stacked: true
						}]
					}			    	
				  }
			});

			// Total income
			var ctx = document.getElementById('chart_total').getContext('2d');
			var chart = new Chart(ctx, {
				  // The type of chart we want to create
				  type: 'line',

				  // The data for our dataset
				  data: {
				      labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
				      datasets: [{
				          label: "Yearly Income",
				          backgroundColor: 'rgb(255, 97, 34)',
				          borderColor: 'rgb(255, 163, 126)',
				          data: [1482, 4671, 7799, 10367, 12278, 14728, 19098, 24642, 26467, 26866],
				      }]
				  },

				  // Configuration options go here
				  options: {
					plugins: {
						datalabels: {
							backgroundColor: function(context) {
								return context.dataset.backgroundColor;
							},
							borderRadius: 4,
							color: 'white',
							font: {
								weight: 'bold'
							},
							formatter: Math.round
						}
					},
					scales: {
						yAxes: [{
							stacked: true
						}]
					}			    	
				  }
			});

			// Transaction type
			var ctx = document.getElementById('chart_transaction_type').getContext('2d');
			var chart = new Chart(ctx, {
				  // The type of chart we want to create
				  type: 'doughnut',

				  // The data for our dataset
				  data: {
				      labels: ["Cash", "Checks", "Credit Cards"],
				      datasets: [{
					      backgroundColor: [
					      	'rgb(242, 164, 14)',
					      	'rgb(181, 55, 55)',
					      	'rgb(0, 127, 161)',
					      	'rgb(0, 161, 103)'
					      ],
				      	data: [7817, 13853, 5197]
				      }]
				  },

				  // Configuration options go here
				options: {
					plugins: {
						datalabels: {
							backgroundColor: function(context) {
								return context.dataset.backgroundColor;
							},
							borderColor: 'white',
							borderRadius: 25,
							borderWidth: 2,
							color: 'white',
							display: function(context) {
								var dataset = context.dataset;
								var count = dataset.data.length;
								var value = dataset.data[context.dataIndex];
								return value > count * 1.5;
							},
							font: {
								weight: 'bold'
							},
							formatter: Math.round
						}
					}
				}
			});			

			// Group type
			var ctx = document.getElementById('chart_group_type').getContext('2d');
			var chart = new Chart(ctx, {
				  // The type of chart we want to create
				  type: 'bar',

				  // The data for our dataset
				  data: {
				      labels: ["Astrobreak", "Class", "Observing", "Private", "Public", "School", "UWM"],
				      datasets: [{
				          label: "Income by group type",
					      backgroundColor: [
					      	'rgb(242, 164, 14)',
					      	'rgb(181, 55, 55)',
					      	'rgb(0, 127, 161)',
					      	'rgb(0, 161, 103)',
					      	'rgb(57, 221, 158)',
					      	'rgb(1, 181, 175)',
					      	'rgb(43, 113, 160)'
					      ],
				      	data: [0, 0, -310, 5639, 13021, 7520, 0]
				      }]
				  },

				  // Configuration options go here
				options: {
					plugins: {
						datalabels: {
							color: 'white',
							display: function(context) {
								return context.dataset.data[context.dataIndex] > 15;
							},
							font: {
								weight: 'bold'
							},
							formatter: Math.round
						}
					},
					scales: {
						xAxes: [{
							stacked: true
						}],
						yAxes: [{
							stacked: true
						}]
					}
				}
			});		

		}, 20);

	},
	events: {
		'click .reload_graphs': 'load'
	}

});

/*

	Application Loader
	Version 0.0.4
	
	Process:
		1. Read config.json file that was created by builder.js
		2. Iterate through config.views and load templates in #templates
		3. Iterate through config.backbone elements and iterate through the array, then execute script file (effects app object)
		4. Stop loading animation
		5. Build primary app.AppView view object 

	New Objective:
		Needs to not be async

*/


var config;
$(document).ready(loadConfig);

function loadConfig() {

	console.log('Loading...');

	// Load config.json file via async ajax call
	$.ajax({
		url: '/js/config.json',
		dataType: 'JSON',
		error: function(xhr, textStatus, errorThrown) {
			console.log(xhr);
			console.log(textStatus);
			console.log(errorThrown);
		},
		success: function(res) {
			config = res;
			load();
		}
	});

}

function loadFiles(dir, files, fnct) { // Directory, Files, success(res)

	var num_files = files.length;
	for (var i = 0; i < files.length; i++) {
	
		$.ajax({
			url: dir + files[i],
			async: false,
			error: function(xhr, textStatus, errorThrown) {
				console.log(xhr);
				console.log(textStatus);
				console.log(errorThrown);
				try {
					toastr.error("There was an error");
					toastr.error(errorThrown);
				} catch (err) {
					// Toastr not installed
				}
			},
			success: function(res) {
				// Javascript evaluates automatically
				if (fnct !== null && fnct !== undefined) {
					fnct(res);
				}
			}
		});
	
	}

}

function load() {

	loadFiles('/views/', config.views, function(res) {
		$('#templates').append(res);
	});

	loadFiles('/js/backbone/models/', config.backbone.models);
	
	loadFiles('/js/backbone/collections/', config.backbone.collections);
	
	loadFiles('/js/backbone/views/', config.backbone.views);
	
	setTimeout(function() {
		$('#loading').remove();
		loadPage();
	}, 250);

}

function loadPage() {

	console.log('Assets loaded.');
	app.appView = new app.AppView();

}



/*

	Builder
	Version 0.0.2
	
	Process:
		1. Read all files in /views folder
		2. Add all files in .views as []
		3. Read all files in /js/backbone/models folder
		4. Add all files in .backbone.models as []
		5. Read all files in /js/backbone/collections folder
		6. Add all files in .backbone.collections as []
		7. Read all files in /js/backbone/views folder
		8. Add all files in .backbone.views as []
		9. Output object as config.json in /js folder
		
	Explanation
		For BackboneFire to work, the Backbone data needs to be loaded in the correct order, Models -> Collections -> Views
		This seperation of folders makes this always happen

	Updated firebase -> firebase/public

*/

const fs = require('fs');
var output = {
	 views: [],
	 backbone: {}
};

function build() {
	
	// Get view files
	getFiles('firebase/public/views/', function(files) {
		
		// Push to output object
		console.log(files);
		output.views = files;
	
	});
	
	// Get backbone model files
	getFiles('firebase/public/js/backbone/models', function(files) {
	
		// Push to output object
		output.backbone.models = files;
	
	});

	// Get backbone collection files
	getFiles('firebase/public/js/backbone/collections', function(files) {
	
		// Push to output object
		output.backbone.collections = files;
	
	});
	
	// Get backbone view files
	getFiles('firebase/public/js/backbone/views', function(files) {
	
		// Push to output object
		output.backbone.views = files;
		
		// Write JSON object
		var json = JSON.stringify(output);
		
		// Write to config_test.json
		fs.writeFile('firebase/public/js/config.json', json, function(err) {
		
			if (err) return console.log(err);

			console.log(json);
			
			return console.log('Build successful');
		
		}); 		
	
	});	

}

function getFiles(dir, fnct) {

	fs.readdir(dir, function(err, files) {
	
		if (err) return console.log(err);
		
		fnct(files);
	
	});

}

build();

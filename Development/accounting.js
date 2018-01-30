var fs = require('fs');

var json;

function main() {

	fs.readFile('accounting.json', function(err, data) {

		if (err) return console.log(err);

		json = JSON.parse(data);
		console.log(json);

		parseJson();

	});

}

function parseJson() {
	
}

main();
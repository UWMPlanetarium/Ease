const functions = require('firebase-functions');
const request = require('request');

/*
	apiController
		Params
			fnct -> which function to execute
		Fail function executes whenever something fails

*/

exports.apiController = functions.https.onRequest((req, res) => {
	const fnct = req.body.fnct;
	const googleApiUrl = 'https://script.google.com/macros/s/AKfycbxQavSesJpTI1mNOjzud8dUpHxvarjuL5DKGC53O_m758PZoUcP/exec';
	var fail = function() {
		let obj = JSON.stringify({res: false});
		res.status(200).send(obj);
	}
	var post_data = JSON.stringify({fnct: 'createInvoice'});
	request({
		url: googleApiUrl,
		method: 'POST',
		json: post_data,
		success: function(err, data, body) {
			if (err) return fail();
			res.status(200).send(data);
		}
	})
});

exports.test = functions.https.onRequest((req, res) => {
	res.status(200).send("Hello world");
});
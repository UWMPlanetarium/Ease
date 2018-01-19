// Google Functions
const functions = require('firebase-functions');
// Request object
const request = require('request');

// Api Controller - Interface with google apps script api
// HEAD paramaters - fnct = string, ...
exports.apiController = functions.https.onRequest((req, res) => {

	/* This script does:
		1. Reads the function paramater from the head
			1. if function exists, route to appropriate function
			2. else, send 500 status and {res: false} back to client
	*/

	const fnct = req.body.fnct;
	const googleApiUrl = 'url here';
	
	var fail = function() {
	
		let obj = JSON.stringify({res: false});
		res.status(500).send(obj);
		
	}
	
	if (fnct !== 'undefined') {
	
		if (fnct === 'createEvent') {
		
		// createEvent - Create a new event on the Ease google calendar
		/* HEAD paramaters - data = {event, group}
			event {
				groupID, id, show, activity, presenter, price, numOfPeople, created_by, calEvent 
			},
			group {
				id, groupName, groupGroup, groupType, cellPhone, workPhone, email, grade
			}
		*/
		/* This script does:
			1. Reads the data obj from the head
			2. Sends {function: 'createEvent', data: data} to the google apps script api
			3. Reads response
				1. if response is 'OK', send 200 status and {res: true} back to client
					Incoming Data - data: res.response = true;
				2. else, send 500 status and {res: false} back to client
		*/
		
		if (req.body.data) {
		
			var POST_data = JSON.stringify({fnct: 'createEvent', data: req.body.data});
		
			request({
				url: googleApiUrl,
				method: 'POST',
				json: POST_data,
			}, function(err, res, body) {
			
				if (err) return fail();
				
				// Check that res.respose = true;
				
				var data; // Needs to equal res from google apps script in JSON
				res.status(200).send(data);
			
			});
		
		} else {
			
			fail();
			
		}
		
		} else if (fnct === 'updateEvent') {
		
			// updateEvent - Updates an existing event on the Ease google calendar
			// Head paramaters - data = {new_start, new_end, start, end, event_id}
			/* This script does:
				1. Reads the data obj from the head
				2. Sends {function: 'updateEvent', data: data} to the google apps script api
				3. Reads response
					1. if response is 'OK', send 200 status and {res: true} back to client
					2. else, send 500 status and {res: false} back to client
			
			*/		
		
			if (req.body.data) {
			
				var POST_data = JSON.stringify({fnct: 'updateEvent', data: req.body.data});
			
				request({
					url: googleApiUrl,
					method: 'POST',
					json: POST_data,
				}, function(err, res, body) {
				
					if (err) return fail();
					
					// Check that res.response = true
					
					var data; // Needs to read the response from google as JSON
					res.status(200).send(data);
				
				});
			
			} else {
			
				fail();
				
			}
		
		} else if (fnct === 'createInvoice') {
		
			// createInvoice - Create a new google document from template and replace with correct information
			// Head paramaters - data = {id, name, calEvent, group, workPhone, cellPhone, activity, show, price, numOfPeople, email, grade}
			/* This script does:
				1. Reads the data obj from the head
				2. Sends {function: 'createInvoice', data: data} to the google apps script api
				3. Reads response
					1. if response is 'OK', send 200 status and {res: true} back to client
					2. else, send 500 status and {res: false} back to client
			*/
			
			if (res.body.data) {
			
				var POST_data = JSON.stringify({fnct: 'createInvoice', data: res.body.data});
			
				request({
					url: googleApiUrl,
					method: 'POST',
					json: POST_data,
				}, function(err, res, body) {
				
					if (err) return fail();
					
					// check to make sure res.response = true
					
					var data; // Needs to read the data from google as JSON
					res.status(200).send(data);
				
				});
			
			}		
		
		} else if (fnct === 'getStaffSchedule') {
		
			// getStaffSchedule - Get the information from the staff google calendar
			// Head paramaters - none
			/* This script does:
				1. Sends {function: 'getStaffSchedule'} to ghe google apps script api
				2. Reads response
					1. if response is 'OK', send 200 status and {res: true} back to client
					2. else, send 500 status and {res: false} back to client
			*/
			
			var POST_data = JSON.stringify({fnct: 'getStaffSchedule'});
			
			request({
				url: googleApiUrl,
				method: 'POST',
				json: POST_data,
			}, function(err, res, body) {
			
				if (err) return fail();
				
				// Check to make sure res.response = true;
				
				var data; // Need to get the data from google in JSON format
				res.status(200).send(data);
			
			});		
		
		} else {
		
			fail();
		
		}
	
	} else {
	
		fail();
		
	}

});















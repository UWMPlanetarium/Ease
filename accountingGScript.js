// Needs to clear screen when run

// Global Vars
var spreadSheet = SpreadsheetApp.openById('1lz24NRj-o6koLsDoFQv5cI9JXOC_xQsDAf9-y0xOHpM');
var showSheet = spreadSheet.getSheetByName('Shows');
var expenseSheet = spreadSheet.getSheetByName('Expenses');
var summarySheet = spreadSheet.getSheetByName('Summary');
var playgroundSheet = spreadSheet.getSheetByName('Playground');
var outputSheet = spreadSheet.getSheetByName("output");
var zipsSheet = spreadSheet.getSheetByName('Zips');
var ui = SpreadsheetApp.getUi(); // Get UI element

function toJSON() {

	var last_row = showSheet.getLastRow();
	var data = showSheet.getRange(2, 1, last_row, 10).getValues();
	// Date	Group	Type	Num of People	Total Income	Cash	Check	Credit	Reality Check	Grade

	var array = [];
	// Write to OBJ
	for (var i = 0; i < data.length; i++) {

		var obj = {
			date: data[i][0],
			group: data[i][1],
			type: data[i][2],
			numOfPeople: data[i][3],
			totalIncome: data[i][4],
			cash: data[i][5],
			check: data[i][6],
			credit: data[i][7]
		}

		array.push(obj);

	}

	var json = JSON.stringify(array);
	var part_1 = json.substring(0, 49999);
	var part_2 = json.substring(49999, json.length);
	outputSheet.getRange(1, 1).setValue(part_1);
	outputSheet.getRange(2, 1).setValue(part_2);

}

function onOpen() {

	ui.createMenu('Summary')
		.addItem('Generate Summaries', 'generateSummary')
		.addItem('Generate Grades', 'generateGrades')
		.addItem('Generate Zip Codes', 'generateZipCodes')
	.addToUi();

}

function misc() {
  
  var rowCount = showSheet.getLastRow();
  var data = showSheet.getRange(2, 1, rowCount, 5).getValues();
  
  var total = 0;
  var count = 0;
  
  for (var i = 0; i < data.length; i++) {
    
    ++count;
    total += parseInt(data[i][4]);
    
  }
  
  Logger.log('Shows: ' + count + ' | Total: ' + total);
  
}

function generateZipCodes() { // Create summary from school zipcodes

	var rowCount = showSheet.getLastRow() - 1;
	var data = showSheet.getRange(2, 1, rowCount, 4).getValues();
	// [ [Date, Group, Type, Num of People] ... ]

	var array = [];
	for (var i = 0; i < data.length; i++) {

		if (data[i][2] === 'School') {

			var response = Maps.newGeocoder().setBounds(42.756850, -87.800022, 43.443739, -88.386778).geocode(data[i][1] + ' Milwaukee');
	        
			if (response.results[0] !== undefined) {

				if (response.results[0].address_components[7] !== undefined) {

					if (response.results[0].address_components[7].long_name.length === 5) {
						array.push(response.results[0].address_components[7].long_name);
					}

				}

			}

		}

	}

	array.sort(function(a, b) {
		return b - a;
	});

	for (var j = 0; j < array.length; j++) {

		array[j] = [array[j], 1];

	}

  	zipsSheet.getRange(2, 1, array.length, 2).setValues(array);

}

function OLD() {
	// Seperate information by month
	var months = [];
	for (var i = 0; i < data.length; i++) {
      
		var month = data[i][0].getMonth(); // Returns 0 - 11
      
      	if (months[month] === undefined) {
      		months[month] = [];
      	}
      
		months[month].push(data[i]);

	}
  
    for (var j = 0; j < months.length; j++) {


    	for (var k = 0; k < months[j].length; k++) {



    	}

    }	
}

function generateGrades() {

	var rowCount = showSheet.getLastRow() - 1;
	var data = showSheet.getRange(2, 1, rowCount, 10).getValues();
	// [ [Date, Group, Type, Num of People, Total Income, Cash, Check, Credit, Reality, Grade] ... ]

	// Seperate information by month
	var months = [];
	for (var i = 0; i < data.length; i++) {
      
		var month = data[i][0].getMonth(); // Returns 0 - 11
      
      	if (months[month] === undefined) {
      		months[month] = [];
      	}
      
		months[month].push(data[i]);

	}

	// Loop through months
	for (var j = 0; j < months.length; j++) {

		var object = {
			gradeK: 0,
			grade1: 0,
			grade2: 0,
			grade3: 0,
			grade4: 0,
			grade5: 0,
			grade6: 0,
			grade7: 0,
			grade8: 0,
			grade9: 0,
			grade10: 0,
			grade11: 0,
			grade12: 0
		}

		for (var k = 0; k < months[j].length; k++) {

			var grade = String(months[j][k][9]);

			if (grade !== '') {
          
	            Logger.log(grade);
	          
				if (grade.indexOf(',') !== -1) { // String includes a comma

					grade = grade.split(','); // Returns array of grades

					for (var l = 0; l < grade.length; l++) { // Loop through the array

						var place = 'grade' + grade[l];
						object[place] += 1;

					}


				} else if (grade.indexOf('-') !== -1) { // String is a range

					grade = grade.split('-'); // [Low end, High end]

					if (grade[0] === 'K') { // Starting grade K exception

						object.gradeK += .5;
						grade[0] = '1';

					}

					var startInc = parseInt(grade[0]);
					var endInc = parseInt(grade[1]);

					for (startInc; startInc <= endInc; startInc++) {
                    
						object['grade' + String(startInc)] += .5;

					}

				} else { // Not an array

					var place = 'grade' + grade;
	                Logger.log(place);
					object[place] += 1;
					Logger.log(object[place]);

				}


			}


		}

		// Output to playground
		var outputArray = [ [object.gradeK, object.grade1, object.grade2, object.grade3, object.grade4, object.grade5, object.grade6, object.grade7, object.grade8, object.grade9, object.grade10, object.grade11, object.grade12]]
		playgroundSheet.getRange(j + 2, 2, 1, 13).setValues(outputArray);


	}


}

function generateSummary() {

	var rowCount = showSheet.getLastRow() - 1;
	var data = showSheet.getRange(2, 1, rowCount, 8).getValues();
	// [ [Date, Group, Type, Num of People, Total Income, Cash, Check, Credit] ... ]

	rowCount = expenseSheet.getLastRow() - 1;
	var expenseData = expenseSheet.getRange(2, 1, rowCount, 7).getValues();
	// [ [Date, Item, Type, Total Expense, Cash, Check, Credit] ... ]

	// Get expense data into data array
    for (var q = 0; q < expenseData.length; q++) {

        // Build vars for expense data
        var outputDATA = {};
        
        if (expenseData[q][3] !== '' || expenseData[q][3] !== undefined) {
        	outputDATA.total = expenseData[q][3]*-1;
        }
        if (expenseData[q][4] !== '' || expenseData[q][4] !== undefined) {
        	outputDATA.cash = expenseData[q][4]*-1;
        }
        if (expenseData[q][5] !== '' || expenseData[q][5] !== undefined) {
        	outputDATA.check = expenseData[q][5]*-1;
        }
        if (expenseData[q][6] !== '' || expenseData[q][6] !== undefined) {
        	outputDATA.credit = expenseData[q][6]*-1;
        }
      
		var output = [expenseData[q][0], 'group', expenseData[q][2], 0, outputDATA.total, outputDATA.cash, outputDATA.check, outputDATA.credit];
		data.push(output);

	}

	// Seperate information by month
	var months = [];
	for (var i = 0; i < data.length; i++) {
      
        Logger.log(data[i]);
      
		var month = data[i][0].getMonth(); // Returns 0 - 11
      
      	if (months[month] === undefined) {
      		months[month] = [];
      	}
      
		months[month].push(data[i]);

	}
  
	// All info is sorted by months now.  Create individual summaries
	for (var j = 0; j < months.length; j++) {

        if (months[j] !== undefined) {
          
			var object = {
				numOfShows: 0,
				astrobreak: 0,
				class: 0,
				observing: 0,
				private: 0,
				public: 0,
				school: 0,
				uwm: 0,
				cash: 0,
				check: 0,
				credit: 0,
				totalIncome: 0,
				astroBreakIncome: 0,
				classIncome: 0,
				observingIncome: 0,
				privateIncome: 0,
				publicIncome: 0,
				schoolIncome: 0,
				uwmIncome: 0
			}
	         
			for (var k = 0; k < months[j].length; k++) {

				if (months[j][k][1] !== 'group') {
					object.numOfShows += 1; // Add one to the show count
				}

				if (months[j][k][2] === 'Astrobreak') {
					object.astrobreak += months[j][k][3];
					if (months[j][k][4] !== '') {
						object.astroBreakIncome += months[j][k][4]
					}
				} else if (months[j][k][2] === 'Class') {
					object.class += months[j][k][3];
					if (months[j][k][4] !== '') {
						object.classIncome += months[j][k][4];	
					}
				} else if (months[j][k][2] === 'Observing') {
					object.observing += months[j][k][3];
					if (months[j][k][4] !== '') {
						object.observingIncome += months[j][k][4];	
					}
				} else if (months[j][k][2] === 'Private') {
					object.private += months[j][k][3];
					if (months[j][k][4] !== '') {
						object.privateIncome += months[j][k][4];
					}
				} else if (months[j][k][2] === 'Public') {
					object.public += months[j][k][3];
					if (months[j][k][4] !== '') {
						object.publicIncome += months[j][k][4];	
					}
				} else if (months[j][k][2] === 'School') {
					object.school += months[j][k][3];
					if (months[j][k][4] !== '') {
						object.schoolIncome += months[j][k][4];	
					}
				} else if (months[j][k][2] === 'UWM') {
					object.uwm += months[j][k][3];
					if (months[j][k][4] !== '') {
						object.uwmIncome += months[j][k][4];	
					}
				}

				if (months[j][k][4] !== '') {
					object.totalIncome += months[j][k][4];
				}
				if (months[j][k][5] !== '') {
					object.cash += months[j][k][5];
				}
				if (months[j][k][6] !== '') {
					object.check += months[j][k][6];
				}
				if (months[j][k][7] !== '' && months[j][k][7] !== undefined) {
					object.credit += months[j][k][7];
				}

			}
          
          	var outputArray = [ [object.numOfShows, object.astrobreak, object.class, object.observing, object.private, object.public, object.school, object.uwm] ];
			summarySheet.getRange(j + 2, 2, 1, 8).setValues(outputArray);

			outputArray = [ [object.cash, object.check, object.credit] ];
			summarySheet.getRange(j + 21, 13, 1, 3).setValues(outputArray);

			outputArray = [ [object.astroBreakIncome, object.classIncome, object.observingIncome, object.privateIncome, object.publicIncome, object.schoolIncome, object.uwmIncome] ]
			summarySheet.getRange(j + 21, 3, 1, 7).setValues(outputArray);
	          
	    }

	}

}








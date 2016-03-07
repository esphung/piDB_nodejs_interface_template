





var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile')
var util = require('util')
var fs = require('fs')







// local vars
const PORT = 8000;
var app = express();

//var contents = fs.readFileSync("people.json");// ???

//var jsonContent = JSON.parse(contents);

//var residentList = getPersonDatabase();

//var currentPersonObject = new Person();// ???



// for resident being signed in and out to be stored
var selectedResident = new Resident();

// read database json file
var databaseFilecontents = fs.readFileSync("residentDatabase.json");

// parse the json data
var jsonContent = JSON.parse(databaseFilecontents);

// create list of residents found in file
var residentList = getDatabaseResidents(jsonContent);



// list of reasons for not being home
var reason_list = [
    "None",
    "Food",
    "Church",
    "Meeting",
    "Probation",
    "Court",
    "Work",
    "Other"
];







// configure app ===========================================
app.set('view engine','ejs');
app.set('views',path.join(__dirname, 'views'));











// use middleware ============================================


app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(path.join(__dirname,'bower_components')));












// when client get requests the root page
app.get('/', function (req,res) {

	var currentItemsList = getAllPresentPersonObjects(residentList)
	currentItemsList = getAllFullNamesFromObjectList(currentItemsList);


	// use this to see who gets selected
	// load data from db to view here
	res.render('index',{
/*		isAuthenticated: req.isAuthenticated(),
		user: req.user,*/
		presentTableTitle: "Residents Currently Home",
		notPresentTableTitle: "Residents Currently Signed Out",
		title: jsonContent.databaseName,
		presentResidentsList: getAllPresentPersonObjects(residentList),
		notPresentResidentsList: getAllNotPresentPersonObjects(residentList),
		items: currentItemsList
	});
	console.log('\npage refreshed..')
	console.log('\nCurrent Residents at Home: ',currentItemsList)
});











app.post('/add', function (req,res) {

	var newItem = req.body.newItem;
	var newTextReason = req.body.newTextReason;

	newItem = stripUserInputString(newItem, '/');
	//var list_name_value_lower = '';
	//var possible_name_value_lower = newItem.toLowerCase();



	for (var i = residentList.length - 1; i >= 0; i--) {
		if (newItem == residentList[i].id_num) {
			residentList[i].toggleIsPresent();
			selectedResident = residentList[i];
			res.redirect('/');
			return;

		};
	};



	res.redirect('/');

});












// tell the server to begin listening
app.listen(PORT,function () {
	// tell our server to start listening
	console.log('ready on port ' + PORT)
});



















// VIEW CONTROLLER FUNCTIONS USING JSON ==============================



function getDatabaseResidents (content) {

    // create a virtual db
    var list = [];
    console.log("\n * Creating Database * \n");

    // construct db resident objects from json
    content.residents.forEach(function (item) {
        list.push(new Resident(
        	item.id_num,
        	item.firstName,
        	item.lastName,
        	item.isPresent,
        	item.reasonNotPresent
        ));
    })

    console.log("\n * Finished Database * \n");

    return list;

}// end set up db def







function getAllFullNamesFromObjectList (argument) {
	// get full names from object list argument
	var list = [];
	argument.forEach( function(item) {
		if (item.isPresent == true) {
			list.push(item.firstName + " " + item.lastName);
		}
	});
	return list;
}


function getAllPresentPersonObjects (argument) {
	// takes list of all person objs and returns list of person objects that are present
	var list = [];
	argument.forEach( function(item) {
		if (item.isPresent == true) {
			list.push(item);
		}
	});
	return list;
}

function getAllNotPresentPersonObjects (argument) {
	// takes list of all person objs and returns list of person objects that are present
	var list = [];
	argument.forEach( function(item) {
		if (item.isPresent != true) {
			list.push(item);
		}
	});
	return list;
}





function stripUserInputString(str, delimiter) {
	// delimiter is what to escape
	//  discuss at: http://phpjs.org/functions/preg_quote/
	// original by: booeyOH
	// improved by: Ates Goral (http://magnetiq.com)
	// improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// improved by: Brett Zamir (http://brett-zamir.me)
	// bugfixed by: Onno Marsman
	//   example 1: preg_quote("$40");
	//   returns 1: '\\$40'
	//   example 2: preg_quote("*RRRING* Hello?");
	//   returns 2: '\\*RRRING\\* Hello\\?'
	//   example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
	//   returns 3: '\\\\\\.\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:'

	return String(str)
		.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}// end string validation







// constructor null
function Resident(){
    this.id_num = null;
    this.firstName = null;
    this.lastName = null;
    this.isPresent = true;
    this.reasonNotPresent = null;
}// end null def


// constructer overloaded
function Resident(id_num,f_name,l_name,present_bool, reason){
    this.id_num = id_num;
    this.firstName = f_name;
    this.lastName = l_name;
    this.isPresent = present_bool;
    if (reason != null){
        this.reasonNotPresent = reason;
    } else {
        this.reasonNotPresent = null;
        }
}// end overload def



Resident.prototype.getFullName = function(){
    return this.firstName + " " + this.lastName;
}

Resident.prototype.toggleIsPresent = function(){
	this.isPresent = !this.isPresent;
	if (this.isPresent == true) {
		console.log(this.getFullName() + " has signed in!")
	} else {
		console.log(this.getFullName() + " has signed out!")
	}
}



Resident.prototype.setReasonNotPresent = function(str){
    if (str.length > 0){
        this.reasonNotPresent = str;
        return true;
    } else {
        this.reasonNotPresent = null;
        return false;
    }
}


Resident.prototype.getReasonNotPresent = function(){
    return this.reasonNotPresent;
}




Resident.prototype.setIsPresent = function(bool_val){
    this.isPresent = bool_val;
}



// methods
Resident.prototype.getIsPresent = function(){
    if (this.isPresent == true){
        alert("Present")
        return true;
    }
    return false;
}


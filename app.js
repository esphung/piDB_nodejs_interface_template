





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
var currentItems = [];
var contents = fs.readFileSync("people.json");
// Define to JSON type
var jsonContent = JSON.parse(contents);







// Constructor
function Foo(bar) {
  // always initialize all instance properties
  this.bar = bar;
  this.baz = 'baz'; // default value
}
// class methods
Foo.prototype.fooBar = function() {
	console.log(this.bar)// test
};
// export the class
module.exports = Foo;


// constructor call
var object = new Foo('Hello');

// call method
object.fooBar();







// configure app
app.set('view engine','ejs');
app.set('views',path.join(__dirname, 'views'));
console.log("\n * Creating Database * \n");
// Get content from file

// Get Value from JSON
console.log("DataBase Name: ", jsonContent.databaseName);
console.log("DataBase Records: ",jsonContent.people);
console.log("\n * Finished Database * \n");












// use middleware

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(path.join(__dirname,'bower_components')));













//var currentItems = peopleDatabase.people.id;

//console.log(currentItems)

/*var people_json = jsonfile.readFile(file, function(err, obj) {
  console.dir(obj);
});*/

//var people_json = jsonfile.readFileSync(file)









/*var currentItems = [
	{ id: 1, desc: 'Eric' },
	{ id: 2, desc: 'Cheryl' },
	{ id: 3, desc: 'Avery' }
]*/





app.get('/', function (req,res) {
	// load data from db to view here
	res.render('index',{
		title: jsonContent.databaseName,
		items: currentItems
	});
});




app.post('/add', function (req,res) {
	/* body... */
	var newItem = req.body.newItem;
	console.log(newItem);


	// do not push until input text is validated !!!!!!!
/*	currentItems.push({
		num: currentItems.length + 1,
		lastName: newItem
	});*/

	res.redirect('/');

});




app.listen(PORT,function () {
	currentItems = getAllPresent();
	console.log(currentItems)
	/* body... */
	console.log('ready on port ' + PORT)
});




// VIEW CONTROLLER FUNCTIONS ==============================

function getAllNums (argument) {
	// get all last name properties as list
	var list = [];
	jsonContent.people.forEach(function (item) {
		list.push(item.num);
		//console.log(item.lastName);
	})
	return list;
}

function getAllLastNames (argument) {
	// get all last name properties as list
	var list = [];
	jsonContent.people.forEach(function (item) {
		list.push(item.lastName);
		//console.log(item.lastName);
	})
	return list;
}

function getAllFirstNames (argument) {
	// get all last name properties as list
	var list = [];
	jsonContent.people.forEach(function (item) {
		list.push(item.firstName);
	})
	return list;
}

function getAllHumanNames (argument) {
	// get all last name properties as list
	var list = [];
	jsonContent.people.forEach(function (item) {
		list.push(item.firstName + " " + item.lastName);
	})
	return list;
}

function getAllPresent (argument) {
	// get all last name properties as list
	var list = [];
	jsonContent.people.forEach(function (item) {
		if (item.isPresent == true) {
			list.push(item.firstName + " " + item.lastName);
		};
	})
	return list;
}




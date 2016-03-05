





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



// configure app
app.set('view engine','ejs');
app.set('views',path.join(__dirname, 'views'));









// use middleware

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(path.join(__dirname,'bower_components')));







console.log("\n *STARTING: READ DATABASE* \n");
// Get content from file
var contents = fs.readFileSync("people.json");
// Define to JSON type
var jsonContent = JSON.parse(contents);


// Get Value from JSON
console.log("DataBase Name: ", jsonContent.databaseName);
console.log("DataBase Records: ",jsonContent.people);


// get all last name properties
jsonContent.people.forEach(function (item) {
	console.log(item.lastName)
})


/*console.log("Email:", jsonContent.email);
console.log("Password:", jsonContent.password);*/
console.log("\n *EXIT: READ DATABASE* \n");


//var currentItems = peopleDatabase.people.id;

//console.log(currentItems)

/*var people_json = jsonfile.readFile(file, function(err, obj) {
  console.dir(obj);
});*/

//var people_json = jsonfile.readFileSync(file)



var currentItems = [
	{ id: 1, desc: 'Eric' },
	{ id: 2, desc: 'Cheryl' },
	{ id: 3, desc: 'Avery' }
]






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

	currentItems.push({
		id: currentItems.length + 1,
		desc: newItem
	});

	res.redirect('/');

});




app.listen(PORT,function () {
	/* body... */
	console.log('ready on port ' + PORT)
});




/*const http = require('http');

http.createServer( (request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Hello World\n');
}).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');*/
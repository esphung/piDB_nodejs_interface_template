var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
const PORT = 8000;

var app = express();



// configure app
app.set('view engine','ejs');
app.set('views',path.join(__dirname, 'views'));



// use middleware

app.use(bodyParser.urlencoded({
	extended: true
}));




// define routes




var currentItems = [
	{ id: 1, desc: 'Eric' },
	{ id: 2, desc: 'Cheryl' },
	{ id: 3, desc: 'Avery' }
];



app.get('/', function (req,res) {
	// load data from db here
	res.render('index',{
		title: 'My App',
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
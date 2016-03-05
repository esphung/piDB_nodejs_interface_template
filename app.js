





var http = require('http');
var express = require('express');
var passport = require('passport');
var passportLocal = require('passport-local');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile')
var util = require('util')
var fs = require('fs')
//var jq = require('jquery');
//var jsdom = require('jsdom');




// included external files
var test_jq = require('./testjq.js');





// local vars
const PORT = 8000;
var app = express();
//var currentItems = [];
var contents = fs.readFileSync("people.json");
// Define to JSON type
var jsonContent = JSON.parse(contents);
var person_object_list = createPersonDatabase();
var new_person = new Person();










// =============================== Person Class Constructor !!!
function Person() {
	// always initialize all instance properties
	this.id_num = 		null;
	this.lastName = 	null; // default value
	this.firstName = 	null;
	this.isPresent = 	false;
	this.isStaff = 		false;
}// end null constructor

function Person(num,l_name,f_name,is_present_bool,is_staff_bool) {
	this.id_num = 		num;
	this.lastName = 	l_name;
	this.firstName = 	f_name;
	this.isPresent = 	is_present_bool;
	this.isStaff = 		is_staff_bool;
}// end overload constructor


// class methods
Person.prototype.getMyIdNum = function() {
	return this.id_num;
};
Person.prototype.setMyIdNum = function (num) {
	this.id_num = num;
}












// configure app ===========================================
app.set('view engine','ejs');
app.set('views',path.join(__dirname, 'views'));











// use middleware ============================================


app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(path.join(__dirname,'bower_components')));


app.use(cookieParser());
app.use(expressSession({
	secret: process.env.SESSION_SECRET || 'secret',
	resave: false,
	saveUninitialized: false
}));



app.use(passport.initialize());
app.use(passport.session());




passport.use(new passportLocal.Strategy(function (username,password, done) {
	possible_usernames = getAllFirstNames();
	possible_usernames.forEach( function(item) {
		console.log(item)
		my_username = username.toLowerCase();
		my_username = my_username.replace(' ','');
		if (my_username === item.toLowerCase()) {
			done( null, {
				id : username,
				name : username
			} );
			console.log('SUCCESSFUL LOGIN!')
		}
	});

	// this is a dummy username and pw
	// set up real stuff later
/*	if (username === password) {
		done( null, { id : username, name : username} );
		console.log('SUCCESSFUL LOGIN!')

	} else {
		done(null,null);
		console.log('LOGIN FAILED!')
	}
	*/
}));




passport.serializeUser(function (user, done) {
	done(null, user.id);
})


passport.deserializeUser(function (id, done) {
	// query database or cache here!
	done(null, { id : id, name : id});
})








function ensureAuthenticated (req,res,next) {
	if(req.isAuthenticated()){
		next();
	} else {
		res.redirect('/login');
	}
}








/*var currentItems = [
	{ id: 1, desc: 'Eric' },
	{ id: 2, desc: 'Cheryl' },
	{ id: 3, desc: 'Avery' }
]*/




app.get('/api/data', ensureAuthenticated, function (req,res){
	res.json([
	{ value : "foo" },
	{ value : "bar" },
	{ value : "baz" }
	])
} )









app.get('/', function (req,res) {

	// use this to see who gets selected
	var currentItems = [];
	// load data from db to view here
	res.render('index',{
		isAuthenticated: req.isAuthenticated(),
		user: req.user,
		title: jsonContent.databaseName,
		items: currentItems
	});
	console.log('\npage refreshed..')
});






app.get('/login', function (req,res) {
	res.render('login');
});




app.post('/login', passport.authenticate('local'),function (req,res) {
	// this is where passport will authenticate the user
	res.redirect('/');

});


app.get('/logout', function (req,res) {
	req.logout();
	res.redirect('/');
})










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
	/* body... */
	console.log('ready on port ' + PORT)
});




// VIEW CONTROLLER FUNCTIONS USING JSON ==============================




function getAllIdNums (argument) {
	// get all last name properties as list
	var list = [];
	jsonContent.people.forEach(function (item) {
		list.push(item.id_num);
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

function getAllFullNames (argument) {
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








function createPersonDatabase (argument) {
	var object_list = [];
	// Get contents from file
	console.log("\n * Creating Database * \n");

	// construct db person objects from json
	jsonContent.people.forEach(function (item) {
		new_person = new Person(item.id_num,item.lastName,item.firstName,item.isPresent,item.isStaff);
		object_list.push(new_person);

	})
	//console.log("DataBase Name: ", jsonContent.databaseName);
	//console.log("DataBase Records: ",jsonContent.people);

	console.log("\n * Finished Database * \n");


	// debug search for staff members
	for (var i = object_list.length - 1; i >= 0; i--) {
		if (object_list[i].isStaff == true) {
			console.log('staff member => ' + object_list[i].firstName + " " + object_list[i].lastName);
		};



	};
	console.log("RECORDS FOUND: " + object_list.length);
	return object_list;
}// end  create db def





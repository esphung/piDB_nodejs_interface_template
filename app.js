/*
AUTHOR:             Eric Phung
CREATED:            2016.03.03 (March 3, 2016)
PURPOSE:            Controller for single page, Express Node Js web app.
NOTES:

*/




var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile')
var util = require('util')
var fs = require('fs')
var httpProxy = require('http-proxy');




var app = express();





var myWriteFileValuePath = './models/activeDatabase.json'












// configure app ===========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.set('port', process.env.PORT || 9000);



// read database json file
app.databaseFilecontents = fs.readFileSync("./models/activeDatabase.json");
// parse the json data
app.jsonContent = JSON.parse(app.databaseFilecontents);
// create list of residents found in file
app.residentList = getDatabaseResidents(app.jsonContent);





// use middleware ============================================


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, 'bower_components')));


/*// tell the server to begin listening
app.listen(PORT, function() {
    // tell our server to start listening
    console.log('ready on port ' + PORT)
});
*/




//
// Create your proxy server and set the target in the options.
//
httpProxy.createProxyServer({target:'http://localhost:9000'}).listen(8000);

http.createServer(app).listen(app.get('port'),
  function(){
    console.log("Express server listening on port " + app.get('port'));
});








// when client get requests the root page
app.get('/', function(req, res) {

    var currentItemsList = getAllPresentPersonObjects(app.residentList)
    currentItemsList = getAllFullNamesFromObjectList(currentItemsList);


    // use this to see who gets selected
    // load data from db to view here
    res.render('index', {

        presentTableTitle: "Currently Home",
        notPresentTableTitle: "Currently Signed Out",
        title: app.jsonContent.databaseName,
        presentResidentsList: getAllPresentPersonObjects(app.residentList),
        notPresentResidentsList: getAllNotPresentPersonObjects(app.residentList),
        items: currentItemsList
    });
    console.log('\nPage was refreshed..')
    console.log('\nCurrent Residents at Home: ', currentItemsList)
});





app.post('/new', function(req,res){

    var staffPassphrase = req.body.staffPassphrase;

    if (staffPassphrase == 'a') {
        var newPinNumber = req.body.newPinNumber;
        var newFirstName = req.body.newFirstName;
        var newLastName = req.body.newLastName;


        var item = {
          "id_num": newPinNumber,
          "firstName": newFirstName,
          "lastName": newLastName,
          "isPresent": true,
          "timeStamp": null,
          "reasonNotPresent": null
        }
    app.jsonContent['residents'].push(item)
    jsonfile.writeFileSync("./models/activeDatabase.json", app.jsonContent)
    app.residentList = getDatabaseResidents(app.jsonContent);
    console.log(app.residentList)


    };

    res.redirect('/')
})









app.post('/add', function(req, res) {


    var newItem = req.body.newItem; // this is an input's name attribute
    var newReason = req.body.newReason;
    console.log(newReason)


    var currentTimeString = timeNow();


    newReason = stripUserInputString(newReason, '/');
    newItem = stripUserInputString(newItem, '/');




    for (var i = app.residentList.length - 1; i >= 0; i--) {
        if (newItem == app.residentList[i].id_num) {


            // check if user is signing IN
            if (app.residentList[i].isPresent == false) {

                app.residentList[i].toggleIsPresent();
                app.jsonContent['residents'][i].isPresent = true;
                app.residentList[i].timeStamp = currentTimeString;
                app.jsonContent['residents'][i].timeStamp = currentTimeString;
                app.residentList[i].reasonNotPresent = null;
                app.jsonContent['residents'][i].reasonNotPresent = newReason;

                jsonfile.writeFileSync(myWriteFileValuePath, app.jsonContent)
                res.redirect('/');
                return;
            } else {
                // user is signing OUT

                // check is they have a valid reason string to leave
                if (newReason.length <= 0) {
                    res.redirect('/');
                    return;
                } else {
                    app.residentList[i].toggleIsPresent();
                    app.jsonContent['residents'][i].isPresent = false;
                    app.residentList[i].timeStamp = currentTimeString;
                    app.jsonContent['residents'][i].timeStamp = currentTimeString;
                    app.residentList[i].reasonNotPresent = newReason;
                    app.jsonContent['residents'][i].reasonNotPresent = newReason;


                    //writeNewResidentObjectToDatabase(app.residentList[i])
                    jsonfile.writeFileSync(myWriteFileValuePath, app.jsonContent)



                    res.redirect('/');
                    return;
                }


            }




        };
    };



    res.redirect('/');

});

































// VIEW CONTROLLER FUNCTIONS ==============================




function getDatabaseResidents(content) {

    // create a virtual db
    var list = [];
    console.log("\n * Creating Database * \n");

    // construct db resident objects from json
    content.residents.forEach(function(item) {
    	//id_num,f_name,l_name,present_bool,reason
        list.push(new Resident(
            item.id_num,
            item.firstName,
            item.lastName,
            item.isPresent,
            item.reasonNotPresent,
            this.timeStamp
        ));
        console.log(item)
    })

    console.log("\n * Finished Database * \n");

    return list;

} // end set up db resident objects function def





function getAllFullNamesFromObjectList(argument) {
    // get full names from object list argument
    var list = [];
    argument.forEach(function(item) {
        if (item.isPresent == true) {
            list.push(item.firstName + " " + item.lastName);
        }
    });
    return list;
}


function getAllPresentPersonObjects(argument) {
    // takes list of all person objs and returns list of person objects that are present
    var list = [];
    argument.forEach(function(item) {
        if (item.isPresent == true) {
            list.push(item);
        }
    });
    return list;
}

function getAllNotPresentPersonObjects(argument) {
    // takes list of all person objs and returns list of person objects that are present
    var list = [];
    argument.forEach(function(item) {
        if (item.isPresent != true) {
            list.push(item);
        }
    });
    return list;
}





function stripUserInputString(str, delimiter) {
    //   example 1: preg_quote("$40");
    //   returns 1: '\\$40'
    //   example 2: preg_quote("*RRRING* Hello?");
    //   returns 2: '\\*RRRING\\* Hello\\?'
    //   example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
    //   returns 3: '\\\\\\.\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:'

    return String(str)
        .replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
} // end string validation


function timeNow() {
    var d = new Date();

    if (d.getHours() - 5 < 0) {
        var a = d.getHours() + 7;
    } else {
        var a = d.getHours() -5;
    }

    h = (d.getHours() < 10 ? '0' : '') + (a);

    m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();

    return h + ':' + m;


} // end get time now function def






// constructer overloaded
function Resident(id_num, f_name, l_name, present_bool, reason) {
    this.id_num = id_num;
    this.firstName = f_name;
    this.lastName = l_name;
    this.isPresent = present_bool;
    this.timeStamp = null;
    if (reason != null) {
        this.reasonNotPresent = reason;
    } else {
        this.reasonNotPresent = null;
    }

} // end overload def



Resident.prototype.getFullName = function() {
    return this.firstName + " " + this.lastName;
}

Resident.prototype.toggleIsPresent = function() {
    this.isPresent = !this.isPresent;
    if (this.isPresent == true) {
        console.log(this.getFullName() + " has signed in!")
    } else {
        console.log(this.getFullName() + " has signed out!")
    }
}



Resident.prototype.setReasonNotPresent = function(str) {
    if (str.length > 0) {
        this.reasonNotPresent = str;
        return true;
    } else {
        this.reasonNotPresent = null;
        return false;
    }
}


Resident.prototype.getReasonNotPresent = function() {
    return this.reasonNotPresent;
}




Resident.prototype.setIsPresent = function(bool_val) {
    this.isPresent = bool_val;
}




Resident.prototype.getIsPresent = function() {
    if (this.isPresent == true) {
        alert("Present")
        return true;
    }
    return false;
}









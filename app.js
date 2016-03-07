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







// local vars
const PORT = 8000;
var app = express();




// for resident being signed in and out to be stored
//var selectedResident = new Resident();

// read database json file
var databaseFilecontents = fs.readFileSync("./models/activeDatabase.json");

// parse the json data
var jsonContent = JSON.parse(databaseFilecontents);

// create list of residents found in file
var residentList = getDatabaseResidents(jsonContent);

var myWriteFileValuePath = './models/activeDatabase.json'

// list of reasons for not being home
var currentReasonsList = [
    "Food",
    "Church",
    "Court",
    "Work",
    "Family",
    "Holiday"
];













// configure app ===========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));











// use middleware ============================================


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, 'bower_components')));












// when client get requests the root page
app.get('/', function(req, res) {

    var currentItemsList = getAllPresentPersonObjects(residentList)
    currentItemsList = getAllFullNamesFromObjectList(currentItemsList);


    // use this to see who gets selected
    // load data from db to view here
    res.render('index', {

        presentTableTitle: "Currently Home",
        notPresentTableTitle: "Currently Signed Out",
        title: jsonContent.databaseName,
        presentResidentsList: getAllPresentPersonObjects(residentList),
        notPresentResidentsList: getAllNotPresentPersonObjects(residentList),
        items: currentItemsList,
        reasons: currentReasonsList
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
    jsonContent['residents'].push(item)
    jsonfile.writeFileSync("./models/activeDatabase.json", jsonContent)
    residentList = getDatabaseResidents(jsonContent);
    console.log(residentList)


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




    for (var i = residentList.length - 1; i >= 0; i--) {
        if (newItem == residentList[i].id_num) {


            // check if user is signing IN
            if (residentList[i].isPresent == false) {

                residentList[i].toggleIsPresent();
                jsonContent['residents'][i].isPresent = true;
                residentList[i].timeStamp = currentTimeString;
                jsonContent['residents'][i].timeStamp = currentTimeString;
                residentList[i].reasonNotPresent = null;
                jsonContent['residents'][i].reasonNotPresent = newReason;

                jsonfile.writeFileSync(myWriteFileValuePath, jsonContent)
                res.redirect('/');
                return;
            } else {
                // user is signing OUT

                // check is they have a valid reason string to leave
                if (newReason.length <= 0) {
                    res.redirect('/');
                    return;
                } else {
                    residentList[i].toggleIsPresent();
                    jsonContent['residents'][i].isPresent = false;
                    residentList[i].timeStamp = currentTimeString;
                    jsonContent['residents'][i].timeStamp = currentTimeString;
                    residentList[i].reasonNotPresent = newReason;
                    jsonContent['residents'][i].reasonNotPresent = newReason;


                    //writeNewResidentObjectToDatabase(residentList[i])
                    jsonfile.writeFileSync(myWriteFileValuePath, jsonContent)



                    res.redirect('/');
                    return;
                }


            }




        };
    };



    res.redirect('/');

});







function writeNewResidentObjectToDatabase(new_resident){
    // WRITE:
    var myWriteFileValuePath = './models/activeDatabase.json'
    //var jsonStr = '{"theTeam":[{"teamId":"1","status":"pending"},{"teamId":"2","status":"member"},{"teamId":"3","status":"member"}]}';

    //var obj = JSON.parse(jsonStr);
    //obj['theTeam'].push({"teamId":"4","status":"pending"});
    jsonContent['residents'].push(new_resident)
    //var jsonStr = JSON.stringify(jsonContent);
    //console.log(jsonStr)

    jsonfile.writeFileSync(myWriteFileValuePath, jsonContent)
    //fd.writeFileSync(jsonStr)
    // "{"theTeam":[{"teamId":"1","status":"pending"},{"teamId":"2","status":"member"},{"teamId":"3","status":"member"},{"teamId":"4","status":"pending"}]}"

}







// tell the server to begin listening
app.listen(PORT, function() {
    // tell our server to start listening
    console.log('ready on port ' + PORT)
});



















// VIEW CONTROLLER FUNCTIONS USING JSON ==============================






function getDatabaseResidents(content) {

    // create a virtual db
    var list = [];
    console.log("\n * Creating Database * \n");

    // construct db resident objects from json
    content.residents.forEach(function(item) {
        list.push(new Resident(
            item.id_num,
            item.firstName,
            item.lastName,
            item.isPresent,
            this.timeStamp,
            item.reasonNotPresent
        ));
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
} // end string validation


function timeNow() {
    var d = new Date(),
        h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
        m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    h = h % 12;
    h = h-5;
    if (h <= 12) {
        return h + ':' + m;
    } else {
        return h + ':' + m;
    }

} // end get time now function def




/*// constructor null
function Resident() {
    this.id_num = null;
    this.firstName = null;
    this.lastName = null;
    this.isPresent = true;
    this.timeStamp = null;
    this.reasonNotPresent = null;
} // end null*/


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









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


















// configure app ===========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.set('port', process.env.PORT || 9000);

// set the json file's path to use as database
app.databaseFilePath = './models/activeDatabase.json'


try {
    // read database json file
    app.databaseFilecontents = fs.readFileSync("./models/activeDatabase.json");
    // parse the json data
    app.jsonContent = JSON.parse(app.databaseFilecontents);
    // create list of residents found in file
    app.jsonContent['residents'] = getAllCurrentResidentsList(app.jsonContent['residents']);
} catch(err){
    console.log("FIle is empty => "+err);

}






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


// console show the server's current clock time
console.log("Server time: " + timeNow());

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

    //var currentItemsList = getAllPresentResidentsList(app.jsonContent['residents'])
    //currentItemsList = getAllFullNamesFromObjectList(currentItemsList);


    // use this to see who gets selected
    // load data from db to view here
    res.render('index', {

        presentTableTitle: "Currently Home",
        notPresentTableTitle: "Currently Signed Out",
        title: app.jsonContent.databaseName,
        presentResidentsList: getAllPresentResidentsList(app.jsonContent['residents']),
        notPresentResidentsList: getAllNotPresentResidentsList(app.jsonContent['residents']),
        //items: currentItemsList
    });
    console.log('\nPage was refreshed..')
    console.log('\nALL RESIDENTS: ', getAllCurrentResidentsList(app.jsonContent['residents']))
});





app.post('/new', function(req,res){

    var staffPassphrase = req.body.staffPassphrase;

    // CREATE NEW RESIDENT
    if (staffPassphrase == 'phung') {
        var newPinNumber = req.body.newPinNumber;
        var newFirstName = req.body.newFirstName;
        var newLastName = req.body.newLastName;


        var item = {
          "id_num": newPinNumber,
          "firstName": newFirstName,
          "lastName": newLastName,
          "isPresent": true,
          "timeStamp": timeNow(),
          "reason": "",
          "userActivityLog" : []
        }
    app.jsonContent['residents'].push(item)
    //jsonfile.writeFileSync("./models/activeDatabase.json", app.jsonContent)
    app.jsonContent['residents'] = getAllCurrentResidentsList(app.jsonContent['residents']);
    //console.log(app.jsonContent['residents'])


    };

    res.redirect('/')
})




Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy + "." + (mm[1]?mm:"0"+mm[0]) + "." + (dd[1]?dd:"0"+ "." +dd[0]); // padding
};



function getResidentByIdNum(numStr) {
    for (var i = app.jsonContent['residents'].length - 1; i >= 0; i--) {
        if (app.jsonContent['residents'][i].id_num == numStr) {
            // resient record found
            return app.jsonContent['residents'][i]
        } else {
            return false
        }// end if/else
    }; // end for loop
}// end get resident by id


function getResidentByFirstName(str) {
    for (var i = app.jsonContent['residents'].length - 1; i >= 0; i--) {
        if (app.jsonContent['residents'][i].firstName == str) {
            // resident record found
            return app.jsonContent['residents'][i]
        } else {
            return false
        }// end if/else
    }; // end for loop
}











app.post('/add', function(req, res) {


    var newItem = req.body.newItem; // this is an input's name attribute
    var newReason = req.body.newReason;
    //console.log(newReason)





    var currentTimeString = timeNow();


    //newReason = stripUserInputString(newReason, '/');
    //newItem = stripUserInputString(newItem, '/');




    for (var i = app.jsonContent['residents'].length - 1; i >= 0; i--) {
        if (newItem == app.jsonContent['residents'][i].id_num) {


            // check if user is signing IN
            if (app.jsonContent['residents'].isPresent == false) {

                app.jsonContent['residents'][i] = true;
                //app.jsonContent['residents'][i].isPresent =  app.jsonContent['residents'][i].getIsPresent();

                app.jsonContent['residents'][i].timeStamp = currentTimeString;
                //app.jsonContent['residents'][i].timeStamp = currentTimeString;

                app.jsonContent['residents'][i].reason = newReason;
                //app.jsonContent['residents'][i].reason = newReason;
/*
				dString = new Date();
               var userActivityLog_item = ["In",dString.yyyymmdd(),currentTimeString,newReason]


                //console.log(app.jsonContent['residents'][i].userActivityLog);
                app.jsonContent['residents'][i].userActivityLog.push(userActivityLog_item)
                //app.jsonContent['residents'][i].userActivityLog = app.jsonContent['residents'][i].userActivityLog;

*/
                //jsonfile.writeFileSync(app.databaseFilePath, app.jsonContent)
                //res.redirect('/');
                //return

            } else {
                // user is signing OUT

                // check is they have a valid reason string to leave
                if (newReason.length <= 0) {
                    res.redirect('/');
                    return;
                } else {

                    app.jsonContent['residents'][i].toggleIsPresent();
                    //app.jsonContent['residents'][i].isPresent =  app.jsonContent['residents'][i].getIsPresent();

                    app.jsonContent['residents'][i].timeStamp = currentTimeString;
                    //app.jsonContent['residents'][i].timeStamp = currentTimeString;

                    //app.jsonContent['residents'][i].reason = newReason;
                    app.jsonContent['residents'][i].reason = newReason;


                    dString = new Date();


                    var userActivityLog_item = {
                        "Date" : dString.yyyymmdd(),
                        "Time" : currentTimeString,
                        "Note" : newReason
                    }


                    // if: resident has a userActivityLog list property...then push to it
                    // else: create one and push to it
                    try {
                        // add item to user's userActivityLog
                        app.jsonContent['residents'][i].userActivityLog.push(userActivityLog_item)
                    } catch(err){
                        console.log("This resident doesn't have any user activity, yet! Creating some now!");
                    }

                    //app.jsonContent['residents'][i].userActivityLog.push(userActivityLog_item)
                    //app.jsonContent['residents'][i].userActivityLog = app.jsonContent['residents'][i].userActivityLog;







                    //res.redirect('/');
                }


            }
            jsonfile.writeFileSync(app.databaseFilePath, app.jsonContent)




        };
    };



    res.redirect('/');

});

































// VIEW CONTROLLER FUNCTIONS ==============================





function getAllCurrentResidentsList(content) {

    // create a virtual db
    var list = [];
    console.log("\n * Creating Database * \n");


    for (var i = content.length - 1; i >= 0; i--) {
        //id_num, f_name, l_name, present_bool, reason
        list[i] = new Resident(
            content[i].id_num,
            content[i].firstName,
            content[i].lastName,
            content[i].isPresent,
            content[i].timeStamp,
            content[i].reason

            )

/*
        list[i].id_num              = content[i].id_num,
        list[i].firstName           = content[i].firstName,
        list[i].lastName            = content[i].lastName,
        list[i].isPresent           = content[i].isPresent,
        list[i].timeStamp           = content[i].timeStamp,
        list[i].reason    = content[i].reason
*/
    };// end for each member in json content -> construct new object


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


function getAllPresentResidentsList(argument) {
    // takes list of all person objs and returns list of person objects that are present
    var list = [];
    argument.forEach(function(item) {
        if (item.isPresent == true) {
            list.push(item);
        }
    });
    return list;
}

function getAllNotPresentResidentsList(argument) {
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
        var a = d.getHours();
        h = (d.getHours() < 10 ? '0' : '') + (a);
        m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        n = "a.m."

    }   else if (d.getHours() > 12) {
        var a = d.getHours() - 12;
        h = (d.getHours() < 10 ? '0' : '') + (a);
        m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        n = "p.m."
    } else {
        var a = d.getHours() -5;
        h = (d.getHours() < 10 ? '0' : '') + (a);
        m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        n = "a.m."
    }

    //h = (d.getHours() < 10 ? '0' : '') + (a);

    //m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();

    return h + ':' + m + " " + n;


} // end get time now function def






// constructer overloaded
function Resident(id_num, f_name, l_name, present_bool, reason) {
    this.id_num = id_num;
    this.firstName = f_name;
    this.lastName = l_name;
    this.isPresent = present_bool;
    this.timeStamp = "";
    this.reason = reason,
    this.userActivityLog = [];

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
        this.reason = str;
        return true;
    } else {
        this.reason = "";
        return false;
    }
}


Resident.prototype.getReasonNotPresent = function() {
    return this.reason;
}




Resident.prototype.setIsPresent = function(bool_val) {
    this.isPresent = bool_val;
}




Resident.prototype.getIsPresent = function() {
    if (this.isPresent == true) {
        //alert("Present")
        return true;
    }
    return false;
}









"use strict";
var express = require('express');
var	app = express();
//var server = require('http').Server(app);
var io = require('socket.io').listen(app.listen(3000));
var fs = require('fs');
var jf = require('jsonfile');
var bodyParser = require('body-parser');
var jsonObjects = [];//For storing the json Objects in the /lib dir.
var jadeAssignments = [];//For storing objects being passed to jade
var tab1_name = "";//want to use this to store the names of the classes
                        //and remove the hard coded strings 
var tab2_name = "";//variable to hold the name of the second tab name

//set up the app================================
//app view engine
app.set('view engine', 'jade');

app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use(bodyParser.urlencoded({extended:true}));//No longer get the error after I added
                                                //.urlencoded({extended:true})
//routes =========================================
app.get('/', function(req, res){
    //Check if jsonObjects.length > 0
    //if jsonObjects.length > 0 then jsonObjects = [];
        jsonObjects = [];
        jadeAssignments = [];
        //call load_lib_files
        load_lib_files();

	res.render('index.jade', { //This is the object I'm passign to jade.
	class1_title: tab1_name,
	class1: jadeAssignments[0],
	class2_title: tab2_name,
	class2: jadeAssignments[1]
	});
    
//If you add more tabs you would need to create additional variables
//and add the jadeAssignments[2] in numerical order.
});

//This route is for adding a new assignment to a class
//it will call the / page after you add the assignment; and will show up as soon as its 
//done loading.
app.post('/newAssignment', function(req, res){//app.post because it is creating a new assignment object.
    //THese are the variables collected from user input
	var asign_name = req.body.assignment_name,
	active_tab = req.body.active_class_variable,
	notes = req.body.initial_notes,
    asign_obj_template = { "name": asign_name, "notes": notes, "status":"", "permanent": "0" };
    
    console.log("app.post(); active_tab = " + active_tab);
    
    //Loop through the jsonObjects[]
    for(var i = 0; i < jsonObjects.length; i++){
        var jsonobj = jsonObjects[i],
            o = jsonobj['class'].toString().trim(), //the current json objects 'class' value
            a = active_tab.toString().trim(); //the current tab

        if((o.indexOf(a)) >= 0){//If current jsonObject[i]["class"] == active_tab {WANT NEW NAMES FOR THESE VARIABLES}
            //This is the object we need to add #{asign_obj_template} to jsonobject.assignments
            console.log("=================jsonobj[class] == active_tab " + o);
            var file_path = __dirname + "/lib/" + active_tab.trim().replace(" ", "_") + ".json";
            console.log("app.post(); file_path = " + file_path);
            //Now i have to add the new obj to the 'assignments' of the current json object
            console.log(JSON.stringify(jsonobj['assignments']));
            jsonobj['assignments'].push(asign_obj_template);
            console.log(JSON.stringify(jsonobj['assignments']));
            //write the new jsonobj to the correct file
            jf.writeFileSync(file_path, jsonobj);
            
            console.log("jsonObjects[0] = " + JSON.stringify(jsonObjects[0]));
        }//end if
     
    }//end for
    
    //redirect to main page so the new assignment is accessible
	res.redirect('/');
});
//=================================================================
//socket.io connection
io.on('connection', function(socket){
    console.log("connection to socket.io; socket.client = " + socket.client);
    
    socket.on('saveAssignment', function(data){

        var file_name = JSON.parse(data)['active_class'].trim(),
            new_Notes = JSON.parse(data)['new_notes'];
        
        //Loop through jsonObjects 
        for(var i = 0; i < jsonObjects.length; i++){
            var jsonobj = jsonObjects[i],
            o = jsonobj['class'].trim().toString();
            var assignments_ = jsonobj['assignments'];
            var file_path = __dirname + "/lib/" + file_name.replace(" ", "_") + ".json";
            if((o.indexOf(file_name) >= 0)){
                //Then I can get the assignments and update the notes.
                for(var i = 0; i < assignments_.length; i++){
                    assignments_[i]['notes'] = new_Notes[i];
                    console.log("assignments_[i][notes] = " + assignments_[i]['notes']);
                }
            }
            jf.writeFileSync(file_path, jsonobj);
        }//end for loop jsonObjects[]
    });
    
    socket.on('next_week', function(current_tab){
         var current_class = JSON.parse(current_tab);
        console.log("socket.on(next_week); current_class = " + current_class['_class']);
        for(var i = 0; i < jsonObjects.length; i++){
            var jsonobj = jsonObjects[i];
            var new_assignments = [];
            var jsonobj_class = jsonobj['class'].trim().toString();
            console.log("socket.on(next_week); jsonobj = " + jsonobj);
            console.log("socket.on(next_week); jsonobj_class = " + jsonobj_class);
            //break;
            if(current_class['_class'].indexOf(jsonobj_class) >= 0){
                var jsonasign = jsonobj['assignments'];
                for(var i = 0; i < jsonasign.length; i++){
                    if (jsonasign[i]["permanent"] === "0"){
                        //delete the assignment and notes
                    }else {
                        //add assignment and notes to 'new_assignments' so they can be saved
                        new_assignments.push(jsonasign[i]);
                    }
                }
                jsonobj['assignments'] = new_assignments;
                var file_path = __dirname + "/lib/" + jsonobj_class.replace(" ", "_") + ".json";
                jf.writeFileSync(file_path, jsonobj);
                break;
            }
        }//end of for loop
    });
});
//=================================================================
//load_lib_files() to populate jsonObjects[] from json objects saved in files in /lib
function load_lib_files(){
console.log("======>>>>>load_lib_files();=================");
var lib_files = fs.readdirSync('./lib');
    
//This loops through all the lib_files and uses jsonfile module to 
//read them. Then for the contents in each file, they are pushed onto
//an array that is going to contain all the jsonObjects i need for the 
//assignment objects. This may become its own function as well
for(var i = 0; i < lib_files.length; i++){
	var file = __dirname + '/lib/' + lib_files[i];
	jsonObjects.push(jf.readFileSync(file));
    
}

for(var i = 0; i < jsonObjects.length; i++){
    
    //Add the assignments to jadeAssignments[]...
    jadeAssignments.push(jsonObjects[i]["assignments"]);

    if(i === 0){
        tab1_name = jsonObjects[i]['class'];
        //This is where i should set tab1_object = jsonObjects[i]
        //Do the same for tab2_name; tab2_object = jsonObjects[i]
        //This way I shouldnt have to loop through jsonObjects anymore.
        //Just compare it to tab1_name...if it matches, use tab1_object
        console.log("tab1_name = " + tab1_name);
    }
    if(i === 1){
        tab2_name = jsonObjects[i]['class'];
        console.log("tab2_name = " + tab2_name);
    }
}
}

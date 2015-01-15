//"use strict"; //????Figure out how to implement this....good practice.
var express = require('express');
	app = express();
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
    
    
	//That open object is what I can use to pass jade JS objects
	//console.log("app.get; jadeAssignments.length = " + jadeAssignments.length);
    //console.log("app.get(); jsonObjects[0] = " + JSON.stringify(jsonObjects[0]));
    //console.log("app.get(); jsonObjects[1] = " + JSON.stringify(jsonObjects[1]));
    
    //console.log("app.get(); jadeAssignments[0] = " + JSON.stringify(jadeAssignments[0]));
    //console.log("app.get(); jadeAssignments[1] = " + JSON.stringify(jadeAssignments[1]));
	res.render('index.jade', { //This is the object I'm passign to jade.
	class1_title: tab1_name,
	class1: jadeAssignments[0],
	class2_title: tab2_name,
	class2: jadeAssignments[1]
	});
    //have to send tab1_name and tab2_name to jade to fill in the template for the tabs.....
    
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
        //console.log("app.post();typeof 0; typeof a = "  + typeof o + '; ' + typeof a);
        //console.log("app.post(); 0; a = "  +  o + '; ' +  a);
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
        }
        //else 
    }
    
    //does this add the new assignment right away? is reload required?z
	res.redirect('/');

});

//call load_lib_files();
//load_lib_files();
//=================================================================
//socket.io connection
io.on('connection', function(socket){
    console.log("connection to socket.io; socket.client = " + socket.client);
    
    socket.on('saveAssignment', function(data){
        console.log("socket.io saveAssignment event; JSON.parse(data) = " + JSON.parse(data)['new_notes']);//updated notes[]
        console.log("socket.io saveAssignment event; JSON.parse(data) = " + JSON.parse(data)['active_class']);//Class IT Security
        console.log("jsonObjects = " + jsonObjects);
        var file_name = JSON.parse(data)['active_class'].trim(),
            new_Notes = JSON.parse(data)['new_notes'];
        
        /*
        *I have to open the file and parse out the assignments
        *Loop through each assignment and set the value of ['assignments'][i]['notes'] 
        *to the value of JSON.parse(data)['new_notes'][i]
        */
        for(var i = 0; i < jsonObjects.length; i++){
            var jsonobj = jsonObjects[i],
            o = jsonobj['class'].trim().toString();
            var assignments_ = jsonobj['assignments'];
            var file_path = __dirname + "/lib/" + file_name.replace(" ", "_") + ".json";
            //console.log("file_name, o = " + file_name + " " + o);
            if((o.indexOf(file_name) >= 0)){//if the current jsonObject[class] contains the JSON.parse(data)[active_class]
                console.log("o.indexOf(file_name) > 0 is true......");
                //Then I can get the assignments and update the notes.
                for(var i = 0; i < assignments_.length; i++){//each of the assignments, set assignments_[i]['notes'] = new_Notes[i]
                    assignments_[i]['notes'] = new_Notes[i];
                    console.log("assignments_[i][notes] = " + assignments_[i]['notes']);
                }
            }
            //console.log("assignments_ = " + assignments_[0]['notes']);
            //now i need to take the jsonobj and save it to the correct file.
            jf.writeFileSync(file_path, jsonobj);
        }//end for loop jsonObjects[]
    });
    
    socket.on('next_week', function(current_tab){
        //this event will perform all of the required tasks on the current tab
        //console.log("Socket.on(next_week); jsonObjects[0] = " + jsonObjects[0]);
        //console.log("socket.on(next_week) = " + current_tab);
        
         var current_class = JSON.parse(current_tab);
        console.log("socket.on(next_week); current_class = " + current_class['_class']);
        for(var i = 0; i < jsonObjects.length; i++){
            var jsonobj = jsonObjects[i];
            var jsonobj_class = jsonobj['class'].trim().toString();
            console.log("socket.on(next_week); jsonobj = " + jsonobj);
            console.log("socket.on(next_week); jsonobj_class = " + jsonobj_class);
            //break;
            if(current_class['_class'].indexOf(jsonobj_class) >= 0){
                //if the current jsonObjects[class]
                //matches the current_tab passed in
                //then this is the jsonObject i want to perform the actions on for next_week
                console.log("socket.on(next_week); inside if(currentclass...)");
                
                //Remove all assignments whose 'permanent' attribute is set to false from 'jsonobj'
                //i need all of the 'assignments' in the current jsonobj
                var jsonasign = jsonobj['assignments'];
                console.log("socket.on(next_week); inside if(); jsonasign = " + jsonasign);
                //loop through all the jsonasign objects and check if their 'permanent' property
                //is === 1; if it is 1 then keep it, just delete the notes. if it is 0
                //then delete it.
                console.log("===========" + jsonasign[0]['permanent']);
                for(var i = 0; i < jsonasign.length; i++){
                    console.log("jsonasign[i]['permanent'] = " + jsonasign[i]['permanent']);
                    //check each permanent attribute
                    if (jsonasign[i]["permanent"] === "0"){
                        //delete the assignment and notes
                        console.log("delete the assignment and notes = " + jsonasign[i]);
                    }
                }
                //
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
//console.log("lib_files = " + lib_files);
//console.log(__dirname+'/lib/' + lib_files[0]); //This is the path for each file in lib_files
//console.log(lib_files.length);

//This loops through all the lib_files and uses jsonfile module to 
//read them. Then for the contents in each file, they are pushed onto
//an array that is going to contain all the jsonObjects i need for the 
//assignment objects. This may become its own function as well
for(var i = 0; i < lib_files.length; i++){
	var file = __dirname + '/lib/' + lib_files[i];
	jsonObjects.push(jf.readFileSync(file));
    
}

for(var i = 0; i < jsonObjects.length; i++){
	//console.log(jsonObjects[i]);

	//It will pass each of the jsonObjects/classes to the 
	//generate_html_assignments() method
	//generate_html_assignments(jsonObjects[i]);
    /*
    *I do not want to generate html in javascript. Make a jade template
    *instead. THis way I can just pass the data to jade and it will 
    *be able to take the data and fill a template, then render each template
    *in the right  content area.
    *
    *
    *What do i need to send to jade
    *send just the assignment objects
    *make a loop that will store all the assignment objects into the jadeAssignments[]
    */
    console.log("looping through json objects; i = " + i);
    console.log("loop through json objects; assignment objects = " + JSON.stringify(jsonObjects[i]["assignments"]));
    //Add the assignments to jadeAssignments[]...
    jadeAssignments.push(jsonObjects[i]["assignments"]);
    
    //if i === 0 { tab1_name = jsonObjects[i]['class'] }
    //if i === 1 { tab2_name = jsonObjects[i]['class'] }
    //console.log(tab0_name)
    //conso$le.log(tab1_name)
    if(i === 0){
        tab1_name = jsonObjects[i]['class'];
        console.log("tab1_name = " + tab1_name);
    }
    if(i === 1){
        tab2_name = jsonObjects[i]['class'];
        console.log("tab2_name = " + tab2_name);
    }
}
}

//=====================================
//When the user adds a new assignment, this function will save it to the
//JSON file.
//The name of the JSON file should be the class_name.json
//Right now everything is done to add a new assignment in app.post().
//Once it works right move the functionality to this function.
function save_new_assignment(new_assignment, jsonObect){
	var file_name = jsonObject['class'] + '.json';

	console.log("save_new_assignment(); file_name = " + file_name);
}
//=====================================



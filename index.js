"use strict";
var express = require('express');
var	app = express();
var io = require('socket.io').listen(app.listen(3000));
var fs = require('fs');
var jf = require('jsonfile');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var jsonObjects = [];//For storing the json Objects from the /lib dir.
var jadeAssignments = [];//For storing objects being passed to jade
var tab1_name = "";
var tab1_object = {};
var tab2_name = "";
var tab2_object = {};

//set up the app================================
app.use(favicon(__dirname + '/public/favicon.ico'));
app.set('view engine', 'jade');
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

                                                
//routes =========================================
app.get('/', function(req, res){
        jsonObjects = [];
        jadeAssignments = [];
        //call load_lib_files to load the /lib/.json files/objects into memory
        load_lib_files();

	res.render('index.jade', { 
	class1_title: tab1_name,
	class1: jadeAssignments[0],
	class2_title: tab2_name,
	class2: jadeAssignments[1]
	});
    
//If you add more tabs you would need to create additional variables
//var class3_title, class 3, tab3_name, tab3_object, etc.
});

//This route is called when the user presses [new Assignment] button
app.post('/newAssignment', function(req, res){//app.post because it is creating a new assignment object.
    //These are the variables collected from user input
	var asign_name = req.body.assignment_name,
	active_tab = req.body.active_class_variable,//the active tab sent from client socket
	notes = req.body.initial_notes, //Initial notes for the new assignment sent from client socket
    asign_obj_template = { "name": asign_name, "notes": notes, "status":"", "permanent": "0" };
    
   /* //Loop through the jsonObjects[]
    for(var i = 0; i < jsonObjects.length; i++){
        var jsonobj = jsonObjects[i],
            o = jsonobj['class'].toString().trim(), //the current json objects 'class' value
            a = active_tab.toString().trim(); //the current tab

        if((o.indexOf(a)) >= 0){
            //This is the object we need to add #{asign_obj_template} to jsonobject.assignments
            var file_path = __dirname + "/lib/" + active_tab.trim().replace(" ", "_") + ".json";
            console.log("app.post(newAssignment(); file_path = " + file_path);
            //Now i have to add the new obj to the 'assignments' of the current json object
            jsonobj['assignments'].push(asign_obj_template);
            //write the new jsonobj to the correct file
            jf.writeFileSync(file_path, jsonobj);
            
        }//end if
     
    }//end for*/

    if (active_tab.trim() === tab1_name.trim()){
        console.log("use tab1_object");
        var file_path = __dirname + "/lib/" + active_tab.trim().replace(" ", "_") + ".json";
        tab1_object['assignments'].push(asign_obj_template);//add the new assignment to the 'assignments' array.
        console.log("tab 1 assignments = " + tab1_object['assignments']);
        jf.writeFileSync(file_path, tab1_object);
    }else if (active_tab.trim() === tab2_name.trim()){
        console.log("use tab2_object");
        var file_path = __dirname + "/lib/" + active_tab.trim().replace(" ", "_") + ".json";
        tab2_object['assignments'].push(asign_obj_template);//add the new assignment to the 'assignments' array.
        console.log("tab 2 assignments = " + tab2_object['assignments']);
        jf.writeFileSync(file_path, tab2_object);
    }
    
    //redirect to main page so the new assignment is accessible
    //here i should be able to call io.sockets.emit('reload', {}); to reload the page
    //see if it works after the [next_week] button is pressed...........
	res.redirect('/');
});

//=================================================================
//socket.io connection
io.on('connection', function(socket){
    
    //THis event is when the user presses the [+] button to save changed notes
    socket.on('saveAssignment', function(data){

        var tab_name = JSON.parse(data)['active_class'].trim(),
            new_Notes = JSON.parse(data)['new_notes'];
        console.log("saveAssignment; new_Notes = " + JSON.stringify(new_Notes));
        //Loop through jsonObjects and set the assignments_[i]['notes'] = new_Notes[i]
        //Want to change this by using the tab1/tab2_objects
        //if file_name/active_class == tab1_name then use tab1_object
        //This will eliminate 3 loops over the jsonObjects object through out the program
        /*for(var i = 0; i < jsonObjects.length; i++){
            var jsonobj = jsonObjects[i],
            o = jsonobj['class'].trim().toString();
            var assignments_ = jsonobj['assignments'];
            var file_path = __dirname + "/lib/" + file_name.replace(" ", "_") + ".json";
            
            console.log("saveAssignment; file_path = " + file_path);
            
            if((o.indexOf(file_name) >= 0)){
                //Then I can get the assignments and update the notes.
                for(var i = 0; i < assignments_.length; i++){
                    assignments_[i]['notes'] = new_Notes[i];
                    //console.log("assignments_[i][notes] = " + assignments_[i]['notes']);
                }
            }
            jf.writeFileSync(file_path, jsonobj);
        }//end for loop jsonObjects[]*/
        
        if (tab_name === tab1_name.trim()){
            console.log("use tab1_object");
            var file_path = __dirname + "/lib/" + tab_name.trim().replace(" ", "_") + ".json";
            var asign_length = tab1_object['assignments'].length;
            for(var i = 0; i < asign_length; i++){
                tab1_object['assignments'][i]['notes'] = new_Notes[i];
            }
            
            console.log("tab 1 assignments = " + tab1_object);
            jf.writeFileSync(file_path, tab1_object);
        }else if (tab_name === tab2_name.trim()){
            console.log("use tab2_object");
            var file_path = __dirname + "/lib/" + tab_name.trim().replace(" ", "_") + ".json";
            console.log("file_path = " + file_path);
            var asign_length = tab2_object['assignments'].length;
            for(var i =0; i < asign_length; i++){
                tab2_object['assignments'][i]['notes'] = new_Notes[i];
            }
            
            console.log("tab 2 assignments = " + JSON.stringify(tab2_object['assignments']));
            console.log("before call to write to file...");
            jf.writeFileSync(file_path, tab2_object);
            /*jf.writeFile(file_path, tab2_object, function(err){
                if (err) throw err;
                console.log("inside .writeFile....if this shows---then no error.");
            });*/
            console.log("after call to write to file...");
    }
        
    });
    
    //This event is called when the user presses the [next week] button
    //This removes all of the assignment containers that are not marked 'permanent'
    socket.on('next_week', function(current_tab){
         var current_class = JSON.parse(current_tab);
        
        //This loops through the jsonObjects again
        //Could use the tab1_object/tab2_object to eliminate this loop
        for(var i = 0; i < jsonObjects.length; i++){
            var jsonobj = jsonObjects[i];
            var new_assignments = [];
            var jsonobj_class = jsonobj['class'].trim().toString();
            
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
        //Call reload event on client side to reload the page.
        io.sockets.emit('reload', {});
    });
    
    //THis event will be check_changed, so each time a checkbox is checked or unchecked
    //this event will fire and update the .json file assignment.permanent attributes
    //socket.on('check_changed');
    /*socket.emit('check_changed', JSON.stringify({current_class: active_class,
                                                    permanent_collection: final_array}));
    */
    socket.on('check_changed', function(data){
        var parsed_data = JSON.parse(data);
        console.log("in check_changed Event; parsed_data[current_class] = " + parsed_data['current_class']);
        console.log("in check_changed Event; parsed_data[permanent_collection][0] = " + parsed_data['permanent_collection'][0]);
        //These are the values i was looking for.
        //Need to check the current class
        if (parsed_data['current_class'].trim() === tab1_name.trim()){
            //Use tab1_object
            console.log("inside the if ========================");
            //var for the assignments of tab1_object
            var obj_asignments = tab1_object['assignments'];
            console.log("inside the if; obj_asignments = " + obj_asignments[0]['name']);
            //loop through the obj_asignments....for each assignment
            //Check if there is a matching assignment name in the parsed_data[permanent_collection]
            //if the name matches check to see if the permanent attributes match
            //if not set the permanent attribute to what was passed in
            //if so go to the next iteration.
            for(var i = 0; i < obj_asignments.length; i++){
                var temp_name = obj_asignments[i]['name'].trim();
                console.log(parsed_data['permanent_collection'][i][0]);//this should show the name --add [0]
                if (temp_name === parsed_data['permanent_collection'][i][0].trim()) {
                    //console.log("looping through obj_asignments===================");
                    console.log("temp_name = " + temp_name);
                    //console.log("" + parsed_data[i]['permanent_collection']);
                    //want to check the permanent attribute for each obj_asignments[i]['permanent']
                    //and parsed_data['permanent_collection'][i]
                    //if they match and have the same name they are fine leave as is
                    //if they are different; change the obj_asignments to the value of 
                    //the parsed_data
                }
            }//end for
        }//else if (tab_name === tab2_name.trim()) This will be for the second tab...figure out the first
    })
});

//=================================================================
//load_lib_files() to populate jsonObjects[] from json objects saved in files in /lib
function load_lib_files(){
console.log("======>>>>>load_lib_files();=================");
var lib_files = fs.readdirSync('./lib');
    
//This loops through all the lib_files and uses jsonfile module to 
//read them. Then for the contents in each file, they are pushed onto
//an array that is going to contain all the jsonObjects i need for the 
//assignment objects. 
//THis should be the only loop through the /lib/.json files
for(var i = 0; i < lib_files.length; i++){
	var file = __dirname + '/lib/' + lib_files[i];
	jsonObjects.push(jf.readFileSync(file));
    
}

for(var i = 0; i < jsonObjects.length; i++){
    var jsonAsign = jsonObjects[i]['assignments'];
    console.log("jsonObjects[i][assignments] = " + JSON.stringify(jsonAsign));
    //Add the assignments to jadeAssignments[]...
    jadeAssignments.push(jsonAsign);

    if(i === 0){
        tab1_name = jsonObjects[i]['class'];
        tab1_object = jsonObjects[i];
        console.log("tab1_name = " + tab1_name);
        console.log("tab1_object = " + JSON.stringify(tab1_object));
    }
    if(i === 1){
        tab2_name = jsonObjects[i]['class'];
        tab2_object = jsonObjects[i];
        console.log("tab2_name = " + tab2_name);
        console.log("tab2_object = " + JSON.stringify(tab2_object));
    }
}
}//end load_lib_files()

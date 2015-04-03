"strict mode";
var socket,
    active_class;

$(document).ready(function(){
  	$('.bxslider').bxSlider({
		mode: 'horizontal',
		slideWidth: 350,
		slideMargin: 30,
        maxSlides: 1,
		pager: false,
		controls: true,
		adaptiveHeight: true
	});


    socket = io.connect('http://192.168.1.20:3000');
    
    //socket.io.on(reload) to automatically reload the browser page.
    socket.on('reload', function(data){
        console.log("In socket.on reload");
        location.reload();
    });
});

//#add_assignment.click is called when the user presses the [+] button. It sets the name of the
//active class in the modal
$("#add_assignment").click(function(){
	active_class = $("li.active").text(); //Get the active class
    
    //set the value of the active_class_variable
	document.getElementById("active_class_variable").value = active_class;
});

//#save_assignment.click is called when the user clicks the [save] button
//
$("#save_assignment").click(function(){
    console.log("#save_assignment button clicked.");
    var asignment_objects = [];//variable to store the assignment objects i want to save.
    var active_class_tab = $("li.active").text().trim();//get the current 'active' class
    //Set variables for the tab names to remove hard coded strings
    var tab_names = $("li a"); //Save all of the tab names.
    var tab1_name = tab_names[0].text;
    var tab2_name = tab_names[1].text;
    //If you add more tabs you have to add variables to hold their names
    console.log(tab1_name);
    console.log(active_class_tab);
    if(active_class_tab === tab1_name.trim()){
        console.log("#save_Assignments; inside if");
        $("#class1 li.assignment_container textarea").each(function( index ){
            if(($(this).parent().attr("class")).search("bx-clone") > 0){
                //Dont do anything
            }else {
                //add these assignment objects values to the asignment_objects[] object
                //console.log($(this).parent());
                asignment_objects.push($(this).val());
            }
        });
    }else if(active_class_tab.trim() === tab2_name.trim()){
        //going to change this to use the :not()...
        $("#class2 li.assignment_container textarea").each(function( index ){
            if(($(this).parent().attr("class")).search("bx-clone") > 0){
                //Dont do anything
            }else {
                //add these assignment objects values to the asignment_objects[] object
                console.log($(this).parent());
                asignment_objects.push($(this).val());
            }
        });
    }
    
    socket.emit('saveAssignment', JSON.stringify({active_class: active_class_tab, 
                                                  new_notes: asignment_objects}));
});

//#next_week.click is called when the user clicks the [next week] button
$("#next_week").click(function(){
    var active_class = $("li.active").text().trim(); //Get the active class
    
    socket.emit('next_week', JSON.stringify({_class: active_class }));
});

//Listener for when checkboxes change
$(":checkbox").change(function(){
    active_class = $("li.active").text().trim(); //Get the active class
    console.log(":checkbox; active_class = " + (active_class === "Ethics"));//true
    //these tab_names can be moved to the 'global' scope so they do not need to be declaired
    //in each function...
    var tab_names = $("li a"); //Save all of the tab names. This should be available to all/global....
    var tab1_name = tab_names[0].text.trim();
    var tab2_name = tab_names[1].text.trim();
    console.log(":checkbox; tab_names = " + tab1_name + " : " + tab2_name);
    //Get the assignment objects for the right class
    //for now just use class1; but use an if statement to determine what to use...
    var asin_objects;//$("#class1 li.assignment_container:not(li.assignment_container.bx-clone)");
    var temp = [];//hold h3text, and chkBool in an array and push the array into the object 
    //Ill send to the server
    var final_array = [];//the array/object to send to the server
    
    //Need to figure out what class is used to fill asign_objects[] variable
    if (active_class === tab1_name) {
        //
        asin_objects = $("#class1 li.assignment_container:not(li.assignment_container.bx-clone)");
        console.log("asin_objects = " + asin_objects);
        for (var i = 0; i < asin_objects.length; i++){
            var this_ = asin_objects[i];
            var h3text = this_.childNodes[1].childNodes[0].textContent;
            //var chkBool = this_.childNodes[1].childNodes[1].hasAttribute("checked");
            var chkBool = this_.childNodes[1].childNodes[1].checked;
            console.log("h3text = " + h3text + "; chkBool = " + chkBool);
            temp.push(h3text, chkBool);
            final_array.push(temp);
            temp = [];
        }
        console.log(final_array);
        console.log(active_class);
        socket.emit('check_changed', JSON.stringify({current_class: active_class,
                                                    permanent_collection: final_array}));
    } else if (active_class === tab2_name) {
        //
        asin_objects = $("#class2 li.assignment_container:not(li.assignment_container.bx-clone)");
        console.log("asin_objects = " + asin_objects);
        for (var i = 0; i < asin_objects.length; i++){
            var this_ = asin_objects[i];
            var h3text = this_.childNodes[0].childNodes[0].textContent;
            //var chkBool = this_.childNodes[1].childNodes[1].hasAttribute("checked");
            var chkBool = this_.childNodes[0].childNodes[1].checked;
            console.log("h3text = " + h3text + "; chkBool = " + chkBool);
            temp.push(h3text, chkBool);
            final_array.push(temp);
            temp = [];
        }
        console.log(final_array);
        console.log(active_class);
        
    }
    
    /*
    //test emit function...
    socket.emit('saveAssignment', JSON.stringify({active_class: active_class_tab, 
                                                  new_notes: asignment_objects}));
    
    
    //loop through the asin_objects and store the assignment name and true/false for checkbox
    asign_objects = $("#class1 li.assignment_container:not(li.assignment_container.bx-clone)");
    for (var i = 0; i < asin_objects.length; i++){
        var this_ = asin_objects[i];
        var h3text = this_.childNodes[1].childNodes[0].textContent;
        //var chkBool = this_.childNodes[1].childNodes[1].hasAttribute("checked");
        var chkBool = this_.childNodes[1].childNodes[1].checked;
        console.log("h3text = " + h3text + "; chkBool = " + chkBool);
        temp.push(h3text, chkBool);
        final_array.push(temp);
        temp = [];
    }
    console.log(final_array);
    console.log(active_class);
    //emit an event that sends the active_class, final_array to the server
    //the event is check_changed
    */
});

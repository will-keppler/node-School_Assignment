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
/*
//Listener for when checkboxes change
$(":checkbox").change(function(){
    if($(this).is(":checked")){
        //alert("A checkbox just changed");
        active_class = $("li.active").text().trim();//get the current 'active' class
        var tab1_name = tab_names[0].text;
        var tab2_name = tab_names[1].text;
        
        if(active_class === tab1_name.trim()){
        console.log(":checkbox.change; inside if");
        $("#class1 li.assignment_container").each(function( index ){
            
        });
    }else if(active_class_tab.trim() === tab2_name.trim()){
        $("#class2 li.assignment_container textarea").each(function( index ){
            
        });
    }
    }
});*/

"strict mode";
var socket,
    active_class;

$(document).ready(function(){
  	$('.bxslider').bxSlider({
		mode: 'horizontal',
		slideWidth: 350,
		slideMargin: 40,
        maxSlides: 1,
		pager: false,
		controls: true,
		adaptiveHeight: true,

	});


    socket = io.connect('http://192.168.1.20:3000');
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
    
    if(active_class_tab === "Security Policies"){//want to remove hard coded string...
        $("#class1 li.assignment_container textarea").each(function( index ){
            if(($(this).parent().parent().attr("class")).search("bx-clone") > 0){
                //Dont do anything
            }else {
                //add these assignment objects values to the asignment_objects[] object
                asignment_objects.push($(this).val());
            }
        });
    }else if(active_class_tab.trim() === "Social Psychology"){//want to remove hard coded string...
        $("#class2 li.assignment_container textarea").each(function( index ){
            if(($(this).parent().parent().attr("class")).search("bx-clone") > 0){
                //Dont do anything
            }else {
                //add these assignment objects values to the asignment_objects[] object
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
var socket;
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
	setTimeout(function(){
		window.scrollTo(0,1)
		console.log("Just called scrollTO...");
	}, 1);

    socket = io.connect('http://192.168.1.20:3000');
});

$("#add_assignment").click(function(){
//This .click function sets the value of the current 'active' tab to 
//one of the edit text boxes in the modal when the user is adding an assignment.
	var active_class = $("li.active").text(); //Get the active class
	document.getElementById("active_class_variable").value = active_class;//set the value of the active_class_variable
	console.log("onAddAssignmentClick(); active_class = " + active_class);
	//onAddAssignmentClick();
});


$("#save_assignment").click(function(){
    console.log("#save_assignment button clicked.");
    var asignment_objects = [];//variable to store the assignment objects i want to save.
    
    var active_class_tab = $("li.active").text().trim();//get the current 'active' class
    //dont use document.getElementsByClassName("notes")It returns all elements, even hidden ones.
    if(active_class_tab === "Security Policies"){
        $("#class1 li.assignment_container textarea").each(function( index ){
            if(($(this).parent().parent().attr("class")).search("bx-clone") > 0){
                //console.log($(this).parent.attr("class"));
                //These are the ones i dont need. Dont do anything
            }else {
                //Put these elements in an array of variable so I can send them to the server...
                //Below will give me the text in the text areas;
                //But now it does not filter out the bx-clone <li elements....
                console.log("this.val() = " + $(this).val());
                //console.log("this.parent().parent() = " + $(this).parent().parent().attr("class"));
                asignment_objects.push($(this).val());
            }
        });
    }else if(active_class_tab.trim() === "Social Psychology"){
        $("#class2 li.assignment_container textarea").each(function( index ){
            if(($(this).parent().parent().attr("class")).search("bx-clone") > 0){
                //console.log($(this).attr("class"));
                //These are the ones i dont need
                //continue;
            }else {
                //Put these elements in an array or variable so I can send them to the server...
                //console.log($(this).attr("class"));
                asignment_objects.push($(this).val());
            }
        });
    }//Have to figure a way to compare the active class to the names dynamically...so there are no hard coded strings...
    console.log("asignment_objects = " + JSON.stringify(asignment_objects));
    socket.emit('saveAssignment', JSON.stringify({active_class: active_class_tab, 
                                                  new_notes: asignment_objects}));
    console.log("after the socket.emit call"); 
});

//======================click listener for next week button
$("#next_week").click(function(){
    console.log("Just clicked '#next_week' button click listener;");
    var active_class = $("li.active").text().trim(); //Get the active class
    console.log("#next_week; active_class = " + active_class);
    /*var asignment_objects = [];//variable to store the assignment objects i want to save.
    
    if(active_class === "Security Policies"){
        $("#class1 li.assignment_container").each(function( index ){
            if(($(this).attr("class")).search("bx-clone") > 0){
                //console.log($(this).parent.attr("class"));
                //These are the ones i dont need. Dont do anything
            }else {
                //Put these elements in an array of variable so I can send them to the server...
                //Below will give me the text in the text areas;
                //But now it does not filter out the bx-clone <li elements....
                //console.log("this.val() = " + $(this).val());
                //console.log("this.parent().parent() = " + $(this).parent().parent().attr("class"));
                asignment_objects.push($(this));
            }
        });
    }else if(active_class === "Social Psychology"){
        $("#class2 li.assignment_container").each(function( index ){
            if(($(this).attr("class")).search("bx-clone") > 0){
                //console.log($(this).attr("class"));
                //These are the ones i dont need
                //continue;
            }else {
                //Put these elements in an array or variable so I can send them to the server...
                //console.log($(this).attr("class"));
                //console.log("this.val() = " + $(this));
                asignment_objects.push($(this).text());
            }
        });
    }*///Have to figure a way to compare the active class to the names dynamically...so there are no hard coded strings...
    //Now i have to take the 'assignments'[] object and remove the assignments that do not have the 
    //permanent attribute set to true
    //console.log("asignment_objects = " + JSON.stringify(asignment_objects));
    socket.emit('next_week', JSON.stringify({_class: active_class }));
});
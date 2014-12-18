var socket;
$(document).ready(function(){
  	$('.bxslider').bxSlider({
		mode: 'horizontal',
		slideWidth: 400,
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
/*
*This function will be called when the [Add Assignment] button is pressed
*from the modal.
*First check/set the values of the assignment name and notes <input
*elements
*/
/*
function onAddAssignmentClick() {

var doc = document,
    asign_name = doc.getElementById("assignment_name"),
    initial_notes = doc.getElementById("initial_notes");

console.log("onAddAssignmentClick(); called");
}
########Not sure what this function was suppose to do, but I removed the only call [above]
to it and the functionality is the same....[ REMOVE ]


This is to get the assignment containers from the HTMLCollection.....
$("#class1 li.assignment_container").each(function(index){
  //console.log($(this).attr("class"));
  if(($(this).attr("class")).search("bx-clone") > 0){
    //console.log($(this).attr("class"));
    //These are the ones i dont need
  }else {
    console.log($(this).attr("class"));
  }
});
*/
$("#save_assignment").click(function(){
    console.log("#save_assignment button clicked.");
    var asignment_objects = [];//variable to store the assignment objects i want to save.
    
    var active_class_tab = $("li.active").text().trim();//get the current 'active' class
    //dont use document.getElementsByClassName("notes")It returns all elements, even hidden ones.
    if(active_class_tab === "IT Security"){
        $("#class1 li.assignment_container textarea").each(function( index ){
            if(($(this).parent().parent().attr("class")).search("bx-clone") > 0){
                //console.log($(this).parent.attr("class"));
                //These are the ones i dont need
            }else {
                //Put these elements in an array or variable so I can send them to the server...
                //Below will give me the text in the text areas;
                //But now it does not filter out the bx-clone <li elements....
                console.log("this.val() = " + $(this).val());
                //console.log("this.parent().parent() = " + $(this).parent().parent().attr("class"));
                asignment_objects.push($(this).val());
            }
        });
    }else if(active_class_tab.trim() === "Written Analysis"){
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

//======================click listener for textareas
$("textarea#assignment_notes").click(function(){
    console.log("textarea#assignment_notes.click");
    console.log("this = " + $( this ));
    console.log("this.text = " + $( this ).text());
    
    //open modal
    /*$('#notesModal').modal('show');
    
    $('#btn_insert_notes').click(function(){
        //Get the notes the user entered
        var new_notes = $("#modified_notes");
        console.log("just clicked add_notes; new_notes = " + new_notes.text());
    });*/
});
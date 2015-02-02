#School Assignment Web App

#####ToDo:
* Refactor JavaScript code
* After [next_week] button is pressed...I need to refresh the browser to reflect the changes.
* Move the button bar on top of the assignment container
* Want to put the number of slides total for each class
* Have a notification after [save] is pressed
* Want a way to keep track of the current week/total weeks of each class
* Need a way to set the 'permanent' attribute on each assignment container
* Want a way to be able to delete assignments individually
*Want to move the 'next/prev' buttons in the middle of the bottom of the assignment containers. Also, make the bigger so they are easier to press on a phone

#####Client Tests:
* Add a new assignment to a class
* Save changes to notes in an assignment container
* Next week; all assignments that are not marked 'permanent' will be deleted....and 'permanent' assignments will have their notes deleted

#####Server Tests:
* 

#####Features:
* 

#####The App:
This app is used for keeping track of school assignments. Each tab represents one class, named after the class. A class/tab will hold assignment containers consisting of the assignment name and some notes. 

The data is saved in Json files on the server so when a client connects, no matter what client, they will have access to the class and assignment data.

[+] button is for adding a new assignment container. After pressing the button a bootstrap.js modal will pop up allowing you to enter the name of the new assignment and a edit text box to enter initial notes you want to add to the assignment. When you press the add assignment button on the modal the browser will refresh and the new assignment will be visible.

[save] button is for when the user makes changes to the notes in the assignment containers. The user must press this in order for changes to persist.

[next week] button is for when I enter a new week of class. It will first look at all the assignment containers in the current tab for the 'permanent' attribute. If they are marked permanent their notes will be deleted and the assignment will be saved. If the permanent is false...the assignment is deleted. 

Change the 'permanent' attribute on an assignment: Change...have to manually change this right now. Open the json file in the /lib directory and find the assignment you want to change; and change the value from 0 to 1. 

To change a class/tab: Change...This also has to be manually done by changing the correct json file to the new name of the new class, and delete all the assignments. I want to add a way for the user to make a new class....or replace one class with a new class.

Displaying School.txt.
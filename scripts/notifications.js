var userDistance;
//Notifications 
var userLong;
var userLang;
var thisUserData;

$(document).ready(function(){
    var currentLong;
    var currentLang;
    navigator.geolocation.getCurrentPosition(function(pos) {
                try {
            currentLang = pos.coords.latitude;
            currentLong = pos.coords.longitude;
    
        }
        catch(err) {
            currentLang =54.767004;
            currentLong = -1.570840 ;
            
        }
       
        $.getJSON("/getUsers", function(jsonData){
            for (var i=0; i<jsonData.length; i++){
                
                if (jsonData[i].username == localStorage.username){
                    thisUserData = (jsonData[i]);
                    userDistance = thisUserData.settings.notifDistance;
                    console.log("USER DATA DEFINED");
                }
            }
        })
        $.ajax({
            url: "/getPosts",
            type: "GET",
            dataPassType: "json",
            success: function(dataPass){
                var dataPassReturned = JSON.parse(JSON.stringify(dataPass));
                checkNearbyFoods(dataPassReturned, currentLang, currentLong);
            }
        })
        $("#changeNearbyDistance").click(function(){
            changeDistance();
          //  getUserDistance();
           // changeUserDistance
        })
        $("#notificationsButton").click(function(){
            $(".badge-error").css("background-color", "grey");
           // $("#notificationsBadge").text("");
            $("#counter").text("");
        })
        $('#openFromMap').click(function(){     //MyFunction(); return false; 
        });

    }) 
     
})


// TODOeventually pass in distance as parameter?
function checkNearbyFoods(dataPassReturned, currentLang, currentLong){
    var notifsCurrentlySeen = thisUserData.settings.notifsSeen;
    if (notifsCurrentlySeen == ""){
        console.log("Creating first list of notifcations ")
        notifsCurrentlySeen = [];
    }
   //  notifsCurrentlySeen.push("HEY");
    // count all notifs
    // if numbers different, add most recent
    var dataPass = dataPassReturned;
    var counter = 0;
    var yyy = localStorage.settings;
    for(var i = 0; i < localStorage.length; i++) {
        var userData = localStorage[i];
    }
        
    var oldPosts = [];
        // CALCULATE DISTANCE OF POSTS AND COMPARE
    for (var foodPostElem = 0; foodPostElem < dataPass.length; foodPostElem++){ //iterate through posts
        var foodPost = dataPass[foodPostElem];  
        var dist = getDistanceFromLatLonInKm(foodPost.latitude, foodPost.longitude, currentLang, currentLong)
        var title = foodPost.title;            
        if (dist < userDistance && localStorage.username != foodPost.username){
            // NOW CHECK WHETHERS ITS ALREADY THERE
            if (notifsCurrentlySeen.includes(foodPost._id) == false){
                counter++;
                notifsCurrentlySeen.push(foodPost._id); 
                createNearbyPost(foodPost, dist);
            }
            else{
                oldPosts.push(foodPost._id);
            }
            // Now go through old posts  
        }
    // So it goes through and only adds it if its NOT
    // in the list. 
    }
    // CHANGE NOTIFCAITON NUMBER
    // use counter to check against:
    var newSettings = thisUserData.settings;
    newSettings.notifsSeen = notifsCurrentlySeen;
    if (counter == 0){
        $("#counter").text(" ");
        $(".badge-error").css("background-color", "grey");
        var noNewNotifs = $('<div>');
        noNewNotifs.addClass('panel panel-default');    
        var bodyDiv = $('<h4>');
        bodyDiv.attr("style", "padding-left: 10px")
        bodyDiv.appendTo(noNewNotifs);
        bodyDiv.text("Sorry - No new notifications!");
         $("#notificationList").append(noNewNotifs);
        
    }
    else {
        $("#counter").text("  " +counter.toString()); 
        $(".badge-error").css("background-color", "red");

    }
    createFiveOldPosts(oldPosts, dataPass, currentLang, currentLong);
    // SEND UPDATED DATA TO DATABASE
    var updateData = {username: localStorage.username, field: "settings", newValue: newSettings};
    $.ajax({
        type: "POST",
        url: "/editUser",
        data: updateData,
        dataType: "json"
        
    });
   // NOW REPUSH
}
    
function createNearbyPost(foodPost, dist){
     /***** CREATE NEARBY POST *****/
                // CREATE LIST
                var title = foodPost.title;  
                var notifList = $('<li>');
                notifList.addClass('notification')

                // CREATE DIV FOR LIST
                var notifDiv = $('<div>');
                notifDiv.addClass('panel panel-default');
                notifDiv.appendTo(notifList);

                // CREATE PANEL HEADER
                var headerDiv = $('<div>');
                headerDiv.addClass('panel-heading');
                headerDiv.text("New food post in your local area!");
                headerDiv.appendTo(notifDiv);
                
                var seePostButton = $('<button>');
                seePostButton.addClass("btn btn-primary");
                seePostButton.text("See Post");
                seePostButton.attr("style","float:right;padding-top:0px;postion:absolute; background-color: transparent; border-color: transparent");
                seePostButton.data("foodJson",foodPost);
                seePostButton.attr("href","findFood.html");
                //seePostButton.attr("onClick", "return openModal()")
                seePostButton.click(function(){
                    alert(foodPost.title);
                    //window.location = "findFood.html";
                    //openModal();
                   //seePost(foodPost);
                    var food = $(this).data('foodJson');
                    $('#seePostsModal').modal('toggle');
                   // window.location = "findFood.html";
                    seePost(food);
                   // $('#seePostsModal').modal('show');
                })
                seePostButton.appendTo(headerDiv);

                // CREATE PANEL BODY
                var bodyDiv = $('<div>');
                bodyDiv.addClass('panel-body');
                var spanBody = $('<span>'); // NOT WORKING 
                spanBody.addClass('glyphicon glyphicon-cutlery');
                spanBody.appendTo(bodyDiv);
                bodyDiv.text(foodPost.title + " is this far away : " + dist.toFixed(1));
                
                // FINALISE
                bodyDiv.appendTo(notifDiv);
              
                $("#notificationList").append(notifList);
}

function createFiveOldPosts(oldPosts, dataPass, currentLang, currentLong){
    var oldNotifNotice = $('<div>');
    oldNotifNotice.addClass('panel panel-default');    
    var bodyDiv = $('<h4>');
    bodyDiv.attr("style", "padding-left: 10px")
    bodyDiv.appendTo(oldNotifNotice);
    bodyDiv.text("Older Notifications");

    $("#notificationList").append(oldNotifNotice);
    
    var foodPostElem = 0; 
    var checkNum = oldPosts.length;
    if (checkNum > 5){
        checkNum = 5;
    }
    while (foodPostElem < checkNum){ 
            var foodPost = dataPass[foodPostElem];  
                // NOW CHECK WHETHERS ITS ALREADY THERE
                if (oldPosts.includes(foodPost._id) == true){
                        var dist = getDistanceFromLatLonInKm(foodPost.latitude, foodPost.longitude, currentLang, currentLong);
                        createNearbyPost(foodPost, dist);
                }
        foodPostElem++
     } 

}
    
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
   
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)

}
function changeDistance(){
    userDistance = $('#distanceNearby').val();
    if (userDistance == undefined || userDistance ==""){
        alert("it's undefined");
        //userDistance = "10000"
        
    }
    if (userDistance < 1){
        var text = $("<p>");
        text.text("Input not valid");
        text.addClass("bold");
        text.attr("style", "color:red; padding-top:5px; padding-bottom:0px")
        text.attr("id", "errorMessage")
        text.insertAfter("#distanceValidate");  
    }
    else{
        
       // ("#distanceValidate").remove("#errorMessage");
        $("#errorMessage").remove();
        userDistance = parseInt(userDistance);
        $('#showDistanceNearby').text("Currently showing distances up to " + userDistance + "km");
        // TODO add a listening click button
        var newSettings = thisUserData.settings;
        newSettings.notifDistance = userDistance;
        var updateData = {username: localStorage.username, field: "settings", newValue: newSettings};
        $.ajax({
            type: "POST",
            url: "/editUser",
            data: updateData,
            dataType: "json"

        });
       
        // TODO call reload
        }

}

   /* $.get('account.html', null, function(result){
        //var obj = $(result).find($('#distanceNearby').val());
        obj = $(result).find($('distanceNearby').val());
        alert(obj);
        //var userDistance = $('#distanceNearby').val();
        if (userDistance == undefined || userDistance ==""){

            userDistance = "10000"
        }
        if (userDistance < 1){
            var text = $("<p>");
            text.text("Input not valid");
            text.addClass("bold");
            text.attr("style", "color:red; padding-top:5px; padding-bottom:0px")
            text.attr("id", "errorMessage")
            text.insertAfter("#distanceValidate");  
        }
        else{
           // ("#distanceValidate").remove("#errorMessage");
            $("#errorMessage").remove();
            $('#showDistanceNearby').text("Currently showing distances up to " + userDistance + "km");
            userDistance = parseInt(userDistance);
            // TODO add a listening click button
        }
   */ //});


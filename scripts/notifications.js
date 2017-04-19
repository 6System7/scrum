var userDistance;
//Notifications 
var userLong;
var userLang;
var thisUserData;

$(document).ready(function(){
    getUserDistance();
    var currentLong;
    var currentLang;
    navigator.geolocation.getCurrentPosition(function(pos) {
        currentLang = pos.coords.latitude;
        currentLong = pos.coords.longitude;
        //console.log(currentLong);
    
  //  console.log(currentLong);
        $.getJSON("/getUsers", function(jsonData){
            for (var i=0; i<jsonData.length; i++){
                
                if (jsonData[i].username == localStorage.username){
                    thisUserData = (jsonData[i]);
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
    
}) // end of getNotifications
})


// TODOeventually pass in distance as parameter?
function checkNearbyFoods(dataPassReturned, currentLang, currentLong){
    var notifsCurrentlySeen = thisUserData.settings.notifsSeen;
    //// iterate thorugh if not in post add it !!
    //if (notifsCurrentlySeen == undefined){
        createFirstListOfNotifs = [];
   // }
 //  notifsCurrentlySeen.push("HEY");
    
    //thisUserData.settings.notifsSeen.push("HERE");
    
    var settings = (thisUserData.settings);
    console.log(thisUserData.settings);
    for (var x in Object.keys(settings)){
        console.log(Object.keys(settings)[x]);
        console.log(x)
    }
    // count all notifs
    // if numbers different, add most recent
    var dataPass = dataPassReturned;
    var counter = 0;
    
    var yyy = localStorage.settings;
    for(var i = 0; i < localStorage.length; i++) {
        var userData = localStorage[i];
        //var usernameDB = userData.username;
    }
        
    var chosenPosts = [];
   // for (var category = 0; category < Object.keys(localStorage)["GetData"].length; category++){

     //        alert((Object.keys(localStorage)[category]).toString());
  
        // CALCULATE DISTANCE OF POSTS AND COMPARE
        for (var foodPostElem = 0; foodPostElem < dataPass.length; foodPostElem++){ //iterate through posts
              //  alert(foodPostElem);
            var foodPost = dataPass[foodPostElem]; //alert(foodPost._id);  
            var dist = getDistanceFromLatLonInKm(foodPost.latitude, foodPost.longitude, currentLang, currentLong)
            var title = foodPost.title;
            //alert(localStorage.settings[notificationsSeen]);
            
            if (dist < userDistance && localStorage.username != foodPost.username){
                counter++;
             //   if (notifs)
                
                    
                // CREATE NEARBY POST

                // CREATE LIST
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
                  //  alert(foodPost.title);
                    window.location = "findFood.html";
                    openModal();
                  //  var food = $(this).data('foodJson');
                  //  $('#seePostsModal').modal('show');
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
    
        }
    // alert($("#notificationList > li").length)
    // CHANGE NOTIFCAITON NUMBER
    // use counter to check against:
    //for (var checkPosts = chosenPosts.length; checkPosts > 0; checkPosts--){
        
        
    //}
        
    
   $("#counter").text("  " +counter.toString());
    var previousCounter = counter;
   
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

function getUserDistance(){
    if (userDistance == undefined){
        $.ajax({
           url:"account.html",
           type:'GET',
           success: function(result){
               var html = jQuery('<input>').html(result);
               // alert(html.find("input#distanceNearby").attr("id")); THIS WORKS
               userDistance = html.find("input#distanceNearby").attr("value");

               if (userDistance == undefined || userDistance ==""){

                    userDistance = "10000"
                }
                /*if (userDistance < 1){
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
                }*/
               //alert(userDistance);
               }

        });
    }

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
        $('#showDistanceNearby').text("Currently showing distances up to " + userDistance.toFixed(1) + "km");
        userDistance = parseInt(userDistance);
        //getUserDistance;
        // TODO add a listening click button
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


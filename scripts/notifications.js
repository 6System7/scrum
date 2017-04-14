var userDistance;
//Notifications 
$(document).ready(function(){
    getUserDistance();
    
    $.ajax({
        url: "/getPosts",
        type: "GET",
        dataPassType: "json",
        success: function(dataPass){
            var dataPassReturned = JSON.parse(JSON.stringify(dataPass));
            checkNearbyFoods(dataPassReturned);
        }
    })
    $("#changeNearbyDistance").click(function(){
        changeDistance();
      //  getUserDistance();
       // changeUserDistance
    })
    
}) // end of getNotifications

// TODOeventually pass in distance as parameter?
function checkNearbyFoods(dataPassReturned){
   // alert(userDistance);
    var dataPass = dataPassReturned;
    
    // GET CURRENT POSITIONS
    memberLang = 0;
    memberLong = 0;
    if (navigator.geolocation) { 
        navigator.geolocation.getCurrentPosition(function(pos) {
                memberLang = pos.coords.latitude;
                memberLong = pos.coords.longitude;
            });
        } else {
            initMap(54.775250, -1.584852);
            alert("ERROR IN GETTING LOCATION - Using default location")
        }
        
        // CALCULATE DISTANCE OF POSTS AND COMPARE
        for (var foodPostElem = 0; foodPostElem < dataPass.length; foodPostElem++){ //iterate through posts
              //  alert(foodPostElem);
            var foodPost = dataPass[foodPostElem]; //alert(foodPost._id);  
            var dist = getDistanceFromLatLonInKm(foodPost.latitude, foodPost.longitude, memberLang, memberLong)
            var title = foodPost.title;
            if (dist < userDistance){
                

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

                // CREATE PANEL BODY
                var bodyDiv = $('<div>');
                bodyDiv.addClass('panel-body');
                var spanBody = $('<span>'); // NOT WORKING 
                spanBody.addClass('glyphicon glyphicon-cutlery');
                spanBody.appendTo(bodyDiv);
                bodyDiv.text(foodPost.title + " is this far away : " + dist.toString());
                
                // FINALISE
                bodyDiv.appendTo(notifDiv);
                console.log(notifList.toString());
                $("#notificationList").append(notifList);


            } 
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


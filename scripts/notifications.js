var userDistance;
var userLong;
var userLang;
var thisUserData;

$(document).ready(function(){
    delete localStorage.foodPostToShow;

    var currentLong;
    var currentLang;
    if (currentLang == undefined && currentLong == undefined){
        currentLang = 54.767230;
        currentLong = -1.570390;
    }
    navigator.geolocation.getCurrentPosition(function(pos) {
        currentLang = pos.coords.latitude;
        currentLong = pos.coords.longitude;
    }, function(error) {
        currentLang = 54.767230;
        currentLong = -1.570390; // <--- school of engineering // center of durham --> 54.77525, -1.584852
    });
    $.getJSON("/getUsers", function(jsonData){
        for (var i=0; i<jsonData.length; i++){

            if (jsonData[i].username == localStorage.username){
                thisUserData = (jsonData[i]);
                userDistance = thisUserData.settings.notifDistance;
                // console.log("USER DATA DEFINED");
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
    })
    $("#notificationsButton").click(function(){
        $(".badge-error").css("background-color", "grey");
        $("#counter").text("");
    })
    $('#openFromMap').click(function(){     //MyFunction(); return false;
    });

})

function checkNearbyFoods(dataPassReturned, currentLang, currentLong){
    var notifsCurrentlySeen = thisUserData.settings.notifsSeen;
    if (notifsCurrentlySeen == "" || notifsCurrentlySeen == undefined || notifsCurrentlySeen == "none"){
        //console.log("Creating first list of notifications ")
        notifsCurrentlySeen = [];
    }
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
            }// Now go through old posts
        }
    }
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
    //console.log(oldPosts);
    createFiveOldPosts(oldPosts, dataPass, currentLang, currentLong);
    //console.log("HERE");
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
    //console.log("creating posts");
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
                seePostButton.attr("href","findfood.html");
                seePostButton.click(function(){
                   var food = JSON.stringify($(this).data('foodJson'));

                    localStorage.foodPostToShow = food;
                    //$('#seePostsModal').modal('toggle');
                   window.location.replace("/findfood.html");
                })
                seePostButton.appendTo(headerDiv);

                // CREATE PANEL BODY
                var bodyDiv = $('<div>');
                bodyDiv.addClass('panel-body');
                var spanBody = $('<span>'); // NOT WORKING
                spanBody.addClass('glyphicon glyphicon-cutlery');
                spanBody.appendTo(bodyDiv);
                bodyDiv.text(foodPost.title + " is this far away : " + dist.toFixed(1) + "km");

                // FINALISE
                bodyDiv.appendTo(notifDiv);

                $("#notificationList").append(notifList);
}

function createFiveOldPosts(oldPosts, dataPass, currentLang, currentLong){
    //console.log("create five old Post");
    var oldNotifNotice = $('<div>');
    oldNotifNotice.addClass('panel panel-default');
    var bodyDiv = $('<h4>');
    bodyDiv.attr("style", "padding-left: 10px")
    bodyDiv.appendTo(oldNotifNotice);
    bodyDiv.text("Older Notifications");

    $("#notificationList").append(oldNotifNotice);

    var foodPostElem = 0;
            //console.log("HEREEYAY");

    var checkNum = oldPosts.length;
    if (checkNum > 5){
        checkNum = 5;
    }
    //console.log(oldPosts.length);

    while (foodPostElem < checkNum){
        //console.log("HEREEYAY");
            var foodPost = dataPass[foodPostElem];
                // NOW CHECK WHETHERS ITS ALREADY THERE
                if (oldPosts.includes(foodPost._id) == true){
                        var dist = getDistanceFromLatLonInKm(foodPost.latitude, foodPost.longitude, currentLang, currentLong);
                        //console.log("create fiveee old Post");
                        createNearbyPost(foodPost, dist);
                }
        foodPostElem++
     }
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    //console.log(lat1,lon1,lat2,lon2);

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
   //console.log("DIST : " + d);
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
    }
}

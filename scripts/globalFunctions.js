window.onload = getUsername; redirectCheck();

function redirectCheck(){
    var lockedPages = ["account", "findfood", "postfood", "postManagement", "resetPassword", "chat"];
    var keyValid = authKeyCheck();
    var currentPage = window.location.pathname;
    var onLockedPage = false;
    for(var i = 0; i < lockedPages.length; i++){
        if(currentPage === "/" + lockedPages[i] + ".html"){
            onLockedPage = true;
        }
    }
    if(onLockedPage) {
        if (!keyValid) {
            //alert("You need to be logged in to access this page!");
            window.open("/loginAndRegister.html", "_self");
        }
    }
}

function getUsername(){
    var username = localStorage.username;
    if(username !== undefined){
        $("#navBarUsername").text(username);
    } else {
        $("#navBarUsername").text("Not Logged In");
    }
}

function genAuthKey(username){

    var d = new Date();
    var formattedDate = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();

    var userIP = $.ajax({
        url: "/getIP",
        async: false
    }).responseText;

    // return authKey
    return $.ajax({
        url: "/sha1",
        data: {string: ("scrum " + username + " " + formattedDate + " " + userIP)},
        async: false
    }).responseText;

}

function authKeyCheck(){
    if((localStorage.authkey === undefined) || (localStorage.username === undefined)){
        localStorage.removeItem("username");
        localStorage.removeItem("authkey");
        return false;
    }
    if(localStorage.authkey === genAuthKey(localStorage.username)){
        return true;
    } else {
        localStorage.removeItem("username");
        localStorage.removeItem("authkey");
        return false;
    }
}


// BELOW ARE ALL NOTIFICATIONS

function getNotifications() {
    checkNearbyFoods()
}

// <#JC> Does this need to be in GlobalFunctions? <#JC>
// eventually pass in distance as parameter?
function checkNearbyFoods(){
    memberLang = 0;
    memberLong = 0;
    if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                memberLang = pos.coords.latitude;
                memberLong = pos.coords.longitude;
            });
        } else {
            initMap(54.775250, -1.584852);
        }
        $.ajax({
        url: "/getPosts",
        type: "GET",
        dataType: "json",
        success: function(data){
            var dataReturned = JSON.parse(JSON.stringify(data));
            for(var property in dataReturned) {
                var size = 0;
                var x = dataReturned[property];
                var p2 = "";
                long = 0;
                lat = 0;
                for (var l in x){
                    size++;
                    if (size == 2){
                        p2 = x[l];
                    }
                    if(size == 5){
                        lat = x[l];
                    }
                    if(size == 6){
                        long = x[l];
                    }
                };
                dist = getDistanceFromLatLonInKm(memberLang, memberLong, lat, long).toFixed(1);
                if (dist < 6000){
                    p2 = "<li class='notification'><div class='panel panel-default'><div class = 'panel-heading'> New food post in your local area!'</div><div class = 'panel-body'> <span class='glyphicon glyphicon-cutlery'></span>" +  p2 + " is this far away : " + dist.toString() + "</div></div></li>";
                    document.getElementById("notificationList").insertAdjacentHTML('beforeEnd', p2 );                     
                } 
            }; 
        }
    })
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

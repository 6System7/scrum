window.onload = getUsername; redirectCheck();

function redirectCheck(){
    var lockedPages = ["account", "findfood", "postfood", "postManagement", "chat"];
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

function startChat(user){
  window.open('/chat.html?contact=' + user, '_self');
}


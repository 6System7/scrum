$(function getUsername(){
    var username = localStorage.username;
    if(username !== "" || undefined){
        $("#navbarUsername").text(username);
    }
});

function genAuthKey(username){

    var d = new Date();
    var formattedDate = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();

    var userIP = $.ajax({
        url: "/getIP",
        async: false
    }).responseText;

    var authkey = $.ajax({
        url: "/sha1",
        data: {string: ("scrum " + username + " " + formattedDate + " " + userIP)},
        async: false
    }).responseText;

    return authkey;

}

function authkeyCheck(username){
    return username === genAuthKey(username);
}
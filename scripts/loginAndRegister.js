$(document).on("click", "#loginButton", function() {

});
$(document).on("click", "#registerButton", function() {
    var username = $("#usernameRegisterInput").val();
    var password = $("#passwordRegisterInput").val();
    var confirmPassword = $("#confirmPasswordRegisterInput").val();
    var firstName = $("#firstNameRegisterInput").val();
    var lastName = $("#lastNameRegisterInput").val();
    var email = $("#emailRegisterInput").val();
    if(registerFieldsValid(username, password, confirmPassword, firstName, lastName, email)){
        registerUser(username, password, confirmPassword, firstName, lastName, email);
    }
});

function registerFieldsValid(username, password, confirmPassword, firstName, lastName, email){

    if(username == ""){ return false; }

    $.getJSON("/getUsers", function(data) {
        $.each(data, function(username, password, rating, realname, email) {
           if(username == username){
               return false;
           }
        });
    });

    if(password == ""){ return false; }
    if(password.length < 8 ){ return false; }
    //if(password.contains(digit) == false){ return false; }

    if(confirmPassword != password){ return false; }

    if(firstName == ""){ return false; }

    if(lastName == ""){ return false; }

    if(email == ""){ return false; }

    return true;
}

function registerUser(username, passwordsha1, rating, realname, email){

    userData = {username: username, passwordsha1: passwordsha1, rating: rating, realname: realname, email: email};

    $.ajax({
        type: "POST",
        url: "/addUser",
        data: userData,
        dataType: "json",
        success: function(data) {
            console.log("Success when posting");
        },
        error: function() {
            console.log("Failed when posting");
        }
    });

}
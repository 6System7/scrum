$(document).on("click", "#loginButton", function() {

});
$(document).on("click", "#registerButton", function() {
    console.log("Pressed");
    var username = $("#usernameRegisterInput").val();
    var password = $("#passwordRegisterInput").val();
    var confirmPassword = $("#confirmPasswordRegisterInput").val();
    var firstName = $("#firstNameRegisterInput").val();
    var lastName = $("#lastNameRegisterInput").val();
    var email = $("#emailRegisterInput").val();
    if(registerFieldsValid(username, password, confirmPassword, firstName, lastName, email)){
        console.log("All fields valid!");
        registerUser(username, password, 3, firstName  + " " + lastName, email);
    } else {
        console.log("Fields not Valid!");
    }
});

function registerFieldsValid(username, password, confirmPassword, firstName, lastName, email){

    if(username == ""){ return false; }

    $.getJSON("/getUsers", function(data) {
        $.each(data, function(username, password, rating, realname, email) {
           if(username === username){
               return false;
           }
        });
    });

    if(password === ""){ console.log("Password is Blank"); return false; }
    if(password.length < 8 ){ console.log("Password needs to be 8 characters or longer"); return false; }
    //if(password.contains(digit) == false){ return false; }

    if(confirmPassword !== password){ console.log("Confirm Password must match Password"); return false; }

    if(firstName === ""){ console.log("First Name is Blank"); return false; }

    if(lastName === ""){ console.log("Last Name is Blank"); return false; }

    if(email === ""){ console.log("Email is Blank"); return false; }

    return true;
}

function registerUser(username, passwordsha1, rating, realname, email){

    console.log("Sending user registration request...");

    var userData = {username: username, passwordsha1: passwordsha1, rating: rating, realname: realname, email: email};

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
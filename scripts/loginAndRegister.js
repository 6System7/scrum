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
    $.getJSON("/getUsers", function(jsonData){
        if(registerFieldsValid(jsonData, username, password, confirmPassword, firstName, lastName, email)){
            console.log("All fields valid!");
            registerUser(username, password, 3, firstName  + " " + lastName, email);
        } else {
            console.log("Fields not Valid!");
        }
    });
});

function registerFieldsValid(jsonData, username, password, confirmPassword, firstName, lastName, email){
    
    var invalidField = false;
    
    // USERNAME CHECKS
    if(username === ""){ invalidField = true; }

    for(var i = 0; i < jsonData.length; i++) {
        var userData = jsonData[i];
        var usernameDB = userData.username;
        if (username === usernameDB) {
            console.log("Username taken");
            invalidField = true;
            break;
        }
    }

    // PASSWORD CHECKS
    if(password === ""){ console.log("Password is Blank"); invalidField = true; }

    if(password.length < 8 ){ console.log("Password needs to be 8 characters or longer"); invalidField = true; }

    var passwordContainsNumbers = false;
    for(var digit = 0; digit < 10; digit++) {
        passwordContainsNumbers = password.includes(digit);
        if (passwordContainsNumbers === true) {
            break;
        }
    }
    if(!passwordContainsNumbers){
        console.log("Password must contain numbers");
        invalidField = true;
    }

    //CONFIRM PASSWORD CHECKS
    if(confirmPassword !== password){ console.log("Confirm Password must match Password"); invalidField = true; }

    // FIRST AND LAST NAME CHECKS
    if(firstName === ""){ console.log("First Name is Blank"); invalidField = true; }

    if(lastName === ""){ console.log("Last Name is Blank"); invalidField = true; }

    // EMAIL CHECKS
    if(email === ""){ console.log("Email is Blank"); invalidField = true; }

    for(var i = 0; i < jsonData.length; i++) {
        var userData = jsonData[i];
        var emailDB = userData.email;
        if(email === emailDB){
            console.log("Email already used");
            invalidField = true;
            break;
        }
    }

    return !invalidField;
}

function registerUser(username, password, rating, realname, email){

    console.log("Sending user registration request...");

    var userData = {username: username, password: password, rating: rating, realname: realname, email: email};

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
/* LOGIN SYSTEM **/
$(document).on("click", "#loginButton", function() {

    var username = $("#usernameLoginInput").val();
    var password = $("#passwordLoginInput").val();
    $("#usernameLoginFeedback").html("");
    $("#passwordLoginFeedback").html("");
    $("#loginFeedback").html("");
    var validUsername = false;
    var validPassword = false;

    $.getJSON("/getUsers", function(jsonData){
        for(var i = 0; i < jsonData.length; i++) {
            var userData = jsonData[i];
            if(username === userData.username){
                console.log("Valid Username");
                validUsername = true;
                var inputPasswordSha1 = $.ajax({
                    url: "/sha1",
                    data: {string: password},
                    async: false
                }).responseText;
                if(inputPasswordSha1 === userData.passwordsha1){
                    console.log("Valid Password");
                    validPassword = true;
                    processLogin(username, password);
                    break;
                }
            }
        }
        if(!validUsername){
            $("#usernameLoginFeedback").append("<p class='text-danger'>Username invalid</p>");
            $("#loginFeedback").append("<p class='text-danger'>Error in Login. Please review and try again!</p>");
        } else {
            if(!validPassword){
                $("#passwordLoginFeedback").append("<p class='text-danger'>Incorrect password</p>");
                $("#loginFeedback").append("<p class='text-danger'>Error in Login. Please review and try again!</p>");
            }
        }
    });

});

function processLogin(username, password){
    console.log("Logged in successfully");
    localStorage.username = username;
    saveAuthKey(username);
    $("#loginFeedback").append("<p class='text-success'>Logged in Successfully!</p>");
    getUsername();
}

function saveAuthKey(username){

    var authkey = genAuthKey(username);
    var updateData = {username: username, field: "authkey", newValue: authkey};

    $.ajax({
        type: "POST",
        url: "/editUser",
        data: updateData,
        dataType: "json"
    });

    localStorage.authkey = authkey;

}

/* REGISTER SYSTEM **/
$(document).on("click", "#registerButton", function() {

    console.log("Register Button Pressed");
    var username = $("#usernameRegisterInput").val();
    var password = $("#passwordRegisterInput").val();
    var confirmPassword = $("#confirmPasswordRegisterInput").val();
    var firstName = $("#firstNameRegisterInput").val();
    var lastName = $("#lastNameRegisterInput").val();
    var email = $("#emailRegisterInput").val();
    $.getJSON("/getUsers", function(jsonData){
        if(registerFieldsValid(jsonData, username, password, confirmPassword, firstName, lastName, email)){
            console.log("All fields valid!");
            registerUser(username, password, "", 3, firstName  + " " + lastName, email);
        } else {
            console.log("Fields not Valid!");
        }
    });
});

function registerFieldsValid(jsonData, username, password, confirmPassword, firstName, lastName, email){
    
    var invalidField = false;
    $("#usernameRegisterFeedback").html("");
    $("#passwordRegisterFeedback").html("");
    $("#confirmPasswordRegisterFeedback").html("");
    $("#firstNameRegisterFeedback").html("");
    $("#lastNameRegisterFeedback").html("");
    $("#emailRegisterFeedback").html("");
    $("#registerFeedback").html("");

    // USERNAME CHECKS
    if(username === ""){
        $("#usernameRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        $("#usernameRegisterFeedback").append("<p class='text-danger'>Username can't be blank</p>");
        invalidField = true;
    } else {
        $("#usernameRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    var usernameAvailable = false;
    for(var i = 0; i < jsonData.length; i++) {
        var userData = jsonData[i];
        var usernameDB = userData.username;
        if (username === usernameDB) {
            console.log("Username taken");
            usernameAvailable = false;
            $("#usernameRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
            $("#usernameRegisterFeedback").append("<p class='text-danger'>Username taken</p>");
            invalidField = true;
            break;
        }
    }
    if(usernameAvailable){
        $("#usernameRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    // PASSWORD CHECKS
    if(password === ""){
        console.log("Password is Blank");
        $("#passwordRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        $("#passwordRegisterFeedback").append("<p class='text-danger'>Password can't be blank</p>");
        invalidField = true;
    } else {
        $("#passwordRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    if(password.length < 8 ){
        console.log("Password needs to be 8 characters or longer");
        $("#passwordRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        $("#passwordRegisterFeedback").append("<p class='text-danger'>Password has to be 8+ characters</p>");
        invalidField = true;
    } else {
        $("#passwordRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    var passwordContainsNumbers = false;
    for(var digit = 0; digit < 10; digit++) {
        passwordContainsNumbers = password.includes(digit);
        if (passwordContainsNumbers === true) {
            break;
        }
    }
    if(!passwordContainsNumbers){
        console.log("Password must contain numbers");
        $("#passwordRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        $("#passwordRegisterFeedback").append("<p class='text-danger'>Password must contain at least 1 number</p>");
        invalidField = true;
    } else {
        $("#passwordRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    //CONFIRM PASSWORD CHECKS
    if(confirmPassword !== password){
        console.log("Confirm Password must match Password");
        $("#confirmPasswordRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        $("#confirmPasswordRegisterFeedback").append("<p class='text-danger'>Confirm Password must match Password</p>");
        invalidField = true;
    } else {
        $("#confirmPasswordRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    // FIRST AND LAST NAME CHECKS
    if(firstName === ""){
        $("#firstNameRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        $("#firstNameRegisterFeedback").append("<p class='text-danger'>First Name can't be blank</p>");
        console.log("First Name is Blank");
        invalidField = true;
    } else {
        $("#firstNameRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    if(lastName === ""){
        $("#lastNameRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        $("#lastNameRegisterFeedback").append("<p class='text-danger'>Last Name can't be blank</p>");
        console.log("Last Name is Blank");
        invalidField = true;
    } else {
        $("#lastNameRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    // EMAIL CHECKS
    if(email === ""){
        console.log("Email is Blank");
        $("#emailRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        $("#emailRegisterFeedback").append("<p class='text-danger'>Email can't be blank</p>");
        invalidField = true;
    } else {
        $("#emailRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    var emailAvailable = true;
    for(var i = 0; i < jsonData.length; i++) {
        var userData = jsonData[i];
        var emailDB = userData.email;
        if(email === emailDB){
            console.log("Email already used");
            emailAvailable = false;
            $("#emailRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
            $("#usernameRegisterFeedback").append("<p class='text-danger'>Email given has already been used</p>");
            invalidField = true;
            break;
        }
    }
    if(emailAvailable){
        $("#emailRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    if(invalidField){
        $("#registerFeedback").append("<p class='text-danger'>Error in registration, please review and try again!</p>");
        return false;
    } else {
        $("#registerFeedback").append("<p class='text-success'>Registered Successfully! You have been sent a confirmation email.</p>");
        return true;
    }
}

function registerUser(username, password, authkey, rating, realname, email){

    console.log("Sending user registration request...");

    var userData = {username: username, password: password, authkey: authkey, rating: rating, realname: realname, email: email};

    $.ajax({
        type: "POST",
        url: "/addUser",
        data: userData,
        dataType: "json"
    });

    sendEmailConfirmation(username, password, email, realname);
}

function sendEmailConfirmation(username, password, emailAddress, realname){

    var subject = "Scrum App - Email confirmation";
    var message = "Dear " + realname + '\n' +
        "Welcome to to the Scrum App! Below are your account details: " + '\n \n' +
        "Username: " + username + '\n' +
        "Password: " + password + '\n' +
        '\n' +
        "Best wishes," + '\n' +
        "Scrum Bot";

    $.ajax({
        type: "POST",
        url: "/sendEmail",
        data: {toAddress: emailAddress, subject: subject, message: message}
    });

    console.log("Confirmation Email Sent");

}

/* Enter key submission **/
$(document).ready(function() {
    $(window).keydown(function(event){
        if(event.keyCode === 13) {
            event.preventDefault();
            if(document.activeElement.parentElement.parentElement.id === "loginPanel"){
                document.getElementById("loginButton").click();
            }
            if(document.activeElement.parentElement.parentElement.id === "registerPanel"){
                document.getElementById("registerButton").click();
            }
        }
    });
});
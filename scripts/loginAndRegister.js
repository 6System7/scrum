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
}

function saveAuthKey(username){

    var authkey = genAuthKey(username);
    var updateData = {username: username, field: "authkey", newValue: authkey};

    $.ajax({
        type: "POST",
        url: "/editUser",
        data: updateData,
        dataType: "json",
        success: function() {
            console.log("Success when posting");
        },
        error: function() {
            console.log("Failed when posting");
        }
    });

    localStorage.authkey = authkey;

}

$(document).on("click", "#registerButton", function() {

    //Email Verification

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
        $("#usernameRegisterGroup").addClass("form-group has-error has-feedback");
        $("#usernameRegisterFeedback").append("<p class='text-danger'>Username can't be blank</p>");
        invalidField = true;
    }

    for(var i = 0; i < jsonData.length; i++) {
        var userData = jsonData[i];
        var usernameDB = userData.username;
        if (username === usernameDB) {
            console.log("Username taken");
            $("#usernameRegisterGroup").addClass("form-group has-error has-feedback");
            $("#usernameRegisterFeedback").append("<p class='text-danger'>Username taken</p>");
            invalidField = true;
            break;
        }
    }

    // PASSWORD CHECKS
    if(password === ""){
        console.log("Password is Blank");
        $("#passwordRegisterGroup").addClass("form-group has-error");
        $("#passwordRegisterFeedback").append("<p class='text-danger'>Password can't be blank</p>");
        invalidField = true;
    }

    if(password.length < 8 ){
        console.log("Password needs to be 8 characters or longer");
        $("#passwordRegisterGroup").addClass("form-group has-error");
        $("#passwordRegisterFeedback").append("<p class='text-danger'>Password has to be 8+ characters</p>");
        invalidField = true;
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
        $("#passwordRegisterGroup").addClass("form-group has-error");
        $("#passwordRegisterFeedback").append("<p class='text-danger'>Password must contain at least 1 number</p>");
        invalidField = true;
    }

    //CONFIRM PASSWORD CHECKS
    if(confirmPassword !== password){
        console.log("Confirm Password must match Password");
        $("#confirmPasswordRegisterGroup").addClass("form-group has-error");
        $("#confirmPasswordRegisterFeedback").append("<p class='text-danger'>Confirm Password must match Password</p>");
        invalidField = true;
    }

    // FIRST AND LAST NAME CHECKS
    if(firstName === ""){
        $("#firstNameRegisterGroup").addClass("form-group has-error");
        $("#firstNameRegisterFeedback").append("<p class='text-danger'>First Name can't be blank</p>");
        console.log("First Name is Blank");
        invalidField = true;
    }

    if(lastName === ""){
        $("#lastNameRegisterGroup").addClass("form-group has-error");
        $("#lastNameRegisterFeedback").append("<p class='text-danger'>Last Name can't be blank</p>");
        console.log("Last Name is Blank");
        invalidField = true;
    }

    // EMAIL CHECKS
    if(email === ""){
        console.log("Email is Blank");
        $("#emailRegisterGroup").addClass("form-group has-error");
        $("#emailRegisterFeedback").append("<p class='text-danger'>Email can't be blank</p>");
        invalidField = true;
    }

    for(var i = 0; i < jsonData.length; i++) {
        var userData = jsonData[i];
        var emailDB = userData.email;
        if(email === emailDB){
            console.log("Email already used");
            $("#emailRegisterGroup").addClass("form-group has-error");
            $("#usernameRegisterFeedback").append("<p class='text-danger'>Email given has already been used</p>");
            invalidField = true;
            break;
        }
    }

    if(invalidField){
        $("#registerFeedback").append("<p class='text-danger'>Error in registration, please review and try again!</p>");
        return false;
    } else {
        $("#registerFeedback").append("<p class='text-success'>Registered Successfully! You have been sent an email to verify your account.</p>");
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
        dataType: "json",
        success: function(data) {
            console.log("Success when posting");
        },
        error: function() {
            console.log("Failed when posting");
        }
    });

}
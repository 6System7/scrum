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
                    var trustedIPs = [];
                    if(userData.hasOwnProperty("trustedIPs")) {
                        trustedIPs = userData.trustedIPs;
                    }
                    if(checkIP(trustedIPs)) {
                        processLogin(username, trustedIPs);
                        break;
                    } else {
                        var alertCode = $.ajax({
                            type: "GET",
                            url: "/getUUID",
                            async: false
                        }).responseText;
                        var authIPCode = $.ajax({
                            type: "GET",
                            url: "/sha1",
                            data: {string: alertCode},
                            async: false
                        }).responseText;
                        var ip = $.ajax({
                            type: "GET",
                            url: "/getIP",
                            async: false
                        }).responseText;
                        $.ajax({
                            type: "POST",
                            url: "/addIPAuthToken",
                            data: {username: username, IPToken: authIPCode, ip: ip}
                        });
                        sendSuspectIPEmail(username, userData.email, alertCode ,authIPCode);
                        alert("You seem to be logging in from a new IP. \n " +
                            "You have been sent an authlink via email to confirm your indentity. \n" +
                            "Your alert code is: " + alertCode);
                    }
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

function processLogin(username){
    console.log("Logged in successfully");
    localStorage.username = username;
    saveAuthKey(username);
    $("#loginFeedback").append("<p class='text-success'>Logged in Successfully!</p>");
    wipeForms();
    window.open("/home.html", "_self");
    getUsername();
}

function saveAuthKey(username){

    var authKey = genAuthKey(username);
    var updateData = {username: username, field: "authkey", newValue: authKey};

    $.ajax({
        type: "POST",
        url: "/editUser",
        data: updateData,
        dataType: "json"
    });

    localStorage.authkey = authKey;

}

function checkIP(trustedIPs){
    var userIP = $.ajax({
        type: "GET",
        url: "/getIP",
        async: false
    }).responseText;

    var trustedIPList = trustedIPs;

    var ipTrusted = false;
    for(var i = 0; i < trustedIPList.length; i++){
        if(trustedIPList[i] === userIP){
            ipTrusted = true;
        }
    }

    return ipTrusted;

}

function sendSuspectIPEmail(username, email, alertCode, authIPCode){

    var subject = "Scrum App - New IP Alert";
    var message = "Dear " + username + '\n' +
        "We have had a suspicious login to your account from an unknown IP" + '\n ' +
        "You will have been alerted with a code upon the attempted login which should match the code below" + '\n\n' +
        "Code: " + alertCode + '\n' +
        '\n' +
        "Accept Link: scrum7.herokuapp.com/loginAndRegister.html?token=" + authIPCode + '\n' +
        '\n' +
        "If the code doesn't match then this then do NOT use the above link! " + '\n'+
        "If you didn't request this email then just ignore it" + '\n'+
        "Best wishes," + '\n' +
        "Scrum Bot";

    console.log("ajax call to send email...");
    $.ajax({
        type: "POST",
        url: "/sendEmail",
        data: {toAddress: email, subject: subject, message: message}
    });

    console.log("Username Recovery Email Sent");

}

/* REGISTER SYSTEM **/
$(document).on("click", "#registerButton", function() {

    var username = $("#usernameRegisterInput").val();
    var password = $("#passwordRegisterInput").val();
    var confirmPassword = $("#confirmPasswordRegisterInput").val();
    var firstName = $("#firstNameRegisterInput").val();
    var lastName = $("#lastNameRegisterInput").val();
    var email = $("#emailRegisterInput").val();
    var confirmEmail = $("#confirmEmailRegisterInput").val();
    $.getJSON("/getUsers", function(jsonData){
        if(registerFieldsValid(jsonData, username, password, confirmPassword, firstName, lastName, email, confirmEmail)){
            console.log("All fields valid!");
            registerUser(username, password, "", 3, firstName  + " " + lastName, email);
        } else {
            console.log("Fields not Valid!");
        }
    });
});

function registerFieldsValid(jsonData, username, password, confirmPassword, firstName, lastName, email, confirmEmail){
    
    var invalidField = false;
    var usernameRegisterFeedbackSelector = $("#usernameRegisterFeedback");
    var passwordRegisterFeedbackSelector = $("#passwordRegisterFeedback");
    var confirmPasswordRegisterFeedbackSelector = $("#confirmPasswordRegisterFeedback");
    var firstNameRegisterFeedbackSelector = $("#firstNameRegisterFeedback");
    var lastNameRegisterFeedbackSelector = $("#lastNameRegisterFeedback");
    var emailRegisterFeedbackSelector = $("#emailRegisterFeedback");
    var confirmEmailRegisterFeedbackSelector = $("#confirmEmailRegisterFeedback");
    var registerFeedbackSelector = $("#registerFeedback");
    usernameRegisterFeedbackSelector.html("");
    passwordRegisterFeedbackSelector.html("");
    confirmPasswordRegisterFeedbackSelector.html("");
    firstNameRegisterFeedbackSelector.html("");
    lastNameRegisterFeedbackSelector.html("");
    emailRegisterFeedbackSelector.html("");
    confirmEmailRegisterFeedbackSelector.html("");
    registerFeedbackSelector.html("");

    // USERNAME CHECKS
    if(username === ""){
        $("#usernameRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        usernameRegisterFeedbackSelector.append("<p class='text-danger'>Username can't be blank</p>");
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
            usernameRegisterFeedbackSelector.append("<p class='text-danger'>Username taken</p>");
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
        passwordRegisterFeedbackSelector.append("<p class='text-danger'>Password can't be blank</p>");
        invalidField = true;
    } else {
        $("#passwordRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    if(password.length < 8 ){
        console.log("Password needs to be 8 characters or longer");
        $("#passwordRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        passwordRegisterFeedbackSelector.append("<p class='text-danger'>Password has to be 8+ characters</p>");
        invalidField = true;
    } else {
        $("#passwordRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    var passwordContainsNumbers = false;
    for(var digit = 0; digit < 10; digit++) {
        for(var passwordChar in password){
            if(passwordChar === digit.toString()){
                passwordContainsNumbers = true;
                break;
            }
        }
        if (passwordContainsNumbers === true) {
            break;
        }
    }
    if(!passwordContainsNumbers){
        console.log("Password must contain numbers");
        $("#passwordRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        passwordRegisterFeedbackSelector.append("<p class='text-danger'>Password must contain at least 1 number</p>");
        invalidField = true;
    } else {
        $("#passwordRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    //CONFIRM PASSWORD CHECKS
    if(confirmPassword !== password){
        console.log("Confirm Password must match Password");
        $("#confirmPasswordRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        confirmPasswordRegisterFeedbackSelector.append("<p class='text-danger'>Confirm Password must match Password</p>");
        invalidField = true;
    } else {
        $("#confirmPasswordRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    // FIRST AND LAST NAME CHECKS
    if(firstName === ""){
        $("#firstNameRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        firstNameRegisterFeedbackSelector.append("<p class='text-danger'>First Name can't be blank</p>");
        console.log("First Name is Blank");
        invalidField = true;
    } else {
        $("#firstNameRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    if(lastName === ""){
        $("#lastNameRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        lastNameRegisterFeedbackSelector.append("<p class='text-danger'>Last Name can't be blank</p>");
        console.log("Last Name is Blank");
        invalidField = true;
    } else {
        $("#lastNameRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    // EMAIL CHECKS
    if(email === ""){
        console.log("Email is Blank");
        $("#emailRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        emailRegisterFeedbackSelector.append("<p class='text-danger'>Email can't be blank</p>");
        invalidField = true;
    } else {
        $("#emailRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    var emailAvailable = true;
    for(i = 0; i < jsonData.length; i++) {
        userData = jsonData[i];
        var emailDB = userData.email;
        if(email === emailDB){
            console.log("Email already used");
            emailAvailable = false;
            $("#emailRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
            emailRegisterFeedbackSelector.append("<p class='text-danger'>Email given has already been used</p>");
            invalidField = true;
            break;
        }
    }
    if(emailAvailable){
        $("#emailRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    //CONFIRM EMAIL CHECKS
    if(confirmEmail !== email){
        console.log("Confirm Email must match Email");
        $("#confirmEmailRegisterGroup").removeClass("form-group has-success").addClass("form-group has-error");
        confirmEmailRegisterFeedbackSelector.append("<p class='text-danger'>Confirm Email must match Email</p>");
        invalidField = true;
    } else {
        $("#confirmEmailRegisterGroup").removeClass("form-group has-error").addClass("form-group has-success");
    }

    if(invalidField){
        registerFeedbackSelector.append("<p class='text-danger'>Error in registration, please review and try again!</p>");
        return false;
    } else {
        registerFeedbackSelector.append("<p class='text-success'>Registered Successfully! You have been sent a confirmation email.</p>");
        return true;
    }
}

function registerUser(username, password, authKey, rating, realName, email){

    console.log("Sending user registration request...");
    var defaultSettings = {notifsSeen: "", notifDistance: 20}; //Maddy add to this object
    var userIP = $.ajax({
        type: "GET",
        url: "/getIP",
        async: false
    }).responseText;
    var trustedIPs = [];
    trustedIPs.push(userIP);
    var userData = {username: username, password: password, authKey: authKey, rating: rating, realName: realName, email: email, settings: defaultSettings, trustedIPs: trustedIPs};

    $.ajax({
        type: "POST",
        url: "/addUser",
        data: userData,
        dataType: "json"
    });

    wipeForms();
    sendEmailConfirmation(username, email, realName);
}

function sendEmailConfirmation(username, emailAddress, realName){

    var subject = "Scrum App - Email confirmation";
    var message = "Dear " + realName + '\n' +
        "Welcome to to the Scrum App! Below are your account details: " + '\n \n' +
        "Username: " + username + '\n' +
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

/* Recover Username **/
$(document).on("click", "#recoverUsernameButton", function() {

    $("#recoverUsernameFeedback").html("");
    var email = $("#recoverUsernameInput").val();

    $.getJSON("/getUsers", function(jsonData){

        var emailValid = false;
        var username = "";
        for(var i = 0; i < jsonData.length; i++){
            var userData = jsonData[i];
            if(userData.email === email){
                emailValid = true;
                username = userData.username;
                break;
            }
        }

        if(emailValid){
            sendRecoverUsernameEmail(email, username);
            $("#recoverUsernameFeedback").append("<p class='text-success'>Email sent with Username to given address (assuming address is valid)</p>");
        } else {
            $("#recoverUsernameFeedback").append("<p class='text-danger'>Email address is not registered!</p>");
        }

    });

});

function sendRecoverUsernameEmail(emailAddress, username){

    var subject = "Scrum App - Username Recovery";
    var message = "As requested here is the username you registered with: " + '\n \n' +
        "Username: " + username + '\n' +
        '\n' +
        "If you didn't request this email then just ignore it" + '\n'+
        "Best wishes," + '\n' +
        "Scrum Bot";

    $.ajax({
        type: "POST",
        url: "/sendEmail",
        data: {toAddress: emailAddress, subject: subject, message: message}
    });

    console.log("Username Recovery Email Sent");

}

/* Reset Password **/
$(document).on("click", "#resetPasswordButton", function() {

    $("#resetPasswordFeedback").html("");
    var username = $("#resetPasswordInput").val();

    $.getJSON("/getUsers", function(jsonData){

        var usernameValid = false;
        var email = "";
        for(var i = 0; i < jsonData.length; i++){
            var userData = jsonData[i];
            if(userData.username === username){
                usernameValid = true;
                email = userData.email;
                break;
            }
        }

        if(usernameValid){
            var resetToken = genResetPasswordLink(username);
            var resetLink = "scrumfun.herokuapp.com/resetPassword.html?token=" + resetToken;
            sendResetPasswordEmail(email, username, resetLink);
            $("#resetPasswordFeedback").append("<p class='text-success'>Email sent with Reset Link to address registered with given username (assuming address is valid)</p>");
        } else {
            $("#resetPasswordFeedback").append("<p class='text-danger'>Username is not registered!</p>");
        }

    });

});

function genResetPasswordLink(username){

    var currentDate = new Date(Date.now());
    const HOUR_MULTIPLIER = 60*60*1000;
    var expirationDate = currentDate.getTime() + (24*HOUR_MULTIPLIER);

    var uuid = $.ajax({
        url: "/getUUID",
        async: false
    }).responseText;

    var resetToken = $.ajax({
        url: "/sha1",
        data: {string: uuid + " scrum " + expirationDate},
        async: false
    }).responseText;

    var resetData = {resetToken: resetToken, username: username, expirationDate: expirationDate};

    console.log("adding reset token...");
    $.ajax({
        type: "POST",
        url: "/addResetToken",
        data: resetData,
        dataType: "json"
    });

    return resetToken;

}

function sendResetPasswordEmail(emailAddress, username, resetLink){

    var subject = "Scrum App - Password Reset";
    var message = "Dear " + username + '\n' +
        "As requested here is a link to reset your password: " + '\n \n' +
        "Link: " + resetLink + '\n' +
        '\n' +
        "This link will expire in 24 hours" + '\n'+
        "If you didn't request this email then just ignore it" + '\n'+
        "Best wishes," + '\n' +
        "Scrum Bot";

    console.log("ajax call to send email...");
    $.ajax({
        type: "POST",
        url: "/sendEmail",
        data: {toAddress: emailAddress, subject: subject, message: message}
    });

    console.log("Username Recovery Email Sent");

}

function wipeForms(){
    console.log("Wiping forms...");
    $("#usernameLoginInput").val("");
    $("#passwordLoginInput").val("");
    $("#usernameRegisterInput").val("");
    $("#firstNameRegisterInput").val("");
    $("#lastNameRegisterInput").val("");
    $("#passwordRegisterInput").val("");
    $("#confirmPasswordRegisterInput").val("");
    $("#emailRegisterInput").val("");
    $("#confirmEmailRegisterInput").val("");
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
            if(document.activeElement.parentElement.parentElement.id === "recoverUsernamePanel"){
                document.getElementById("recoverUsernameButton").click();
            }
            if(document.activeElement.parentElement.parentElement.id === "resetPasswordPanel"){
                document.getElementById("resetPasswordButton").click();
            }
        }
    });
});

$(document).ready(checkURL());

function getTokenFromURL(){
    console.log("Getting token from url...");
    var query = window.location.search;
    return query.split("=")[1];
}

function checkURL(){
    $.getJSON("/getIPAuthTokens", function(authTokens){
        var token;
        if(window.location.search !== "") {
            token = getTokenFromURL();

            var tokenValid = false;
            var validTokenData;
            for (var i = 0; i < authTokens.length; i++) {
                var tokenData = authTokens[i];
                if (tokenData.IPToken === token) {
                    tokenValid = true;
                    validTokenData = tokenData;
                    break;
                }
            }
            if (tokenValid) {

                $.getJSON("/getUsers", function (jsonData) {
                    var userData;
                    for (var i = 0; i < jsonData.length; i++) {
                        if (validTokenData.username === jsonData[i].username) {
                            userData = jsonData[i];
                            break;
                        }
                    }
                    $.ajax({
                        type: "POST",
                        url: "/deleteIPAuthToken",
                        data: {IPToken: validTokenData.IPToken}
                    });

                    var newTrustedIPList = userData.trustedIPs;
                    newTrustedIPList.push(validTokenData.ip);

                    $.ajax({
                        type: "POST",
                        url: "/editUser",
                        data: {username: validTokenData.username, field: "trustedIPs", newValue: newTrustedIPList}
                    });

                    alert("IP Authenticated successfully");
                    window.open("/loginAndRegister.html", "_self");
                });

            } else {
                alert("Invalid Token");
                window.open("/loginAndRegister.html", "_self");
            }
        }

    });

}
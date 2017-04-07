$(checkToken(getTokenFromURL()));

function getTokenFromURL(){
    console.log("Getting token from url...");
    var query = window.location.search;
    return query.split("=")[1];
}

function checkToken(token){

    console.log("Checking token...");
    $.getJSON("/getResetTokens", function(jsonData){

        var tokenValid = false;
        var username = null;
        var expirationDate = null;
        for(var i = 0; i < jsonData.length; i++){
            var tokenData = jsonData[i];
            if(tokenData.resetToken === token){
                tokenValid = true;
                username = tokenData.username;
                expirationDate = tokenData.expirationDate;
                break;
            }
        }

        if(!tokenValid){
            $("#initialFeedback").text("Invalid Token!");
            $("#status").text("Token Checked");
            return;
        }

        if(expirationDate < Date.now()){
            $("#initialFeedback").text("Token has expired, please request a new one");
            $("#status").text("Token Checked");
            return;
        }

        localStorage.resetToken = token;

        loadResetForm();

    });

}

function loadResetForm(){

    var pageContentSelector = $("#pageContent");
    pageContentSelector.html("");
    $(
        "<div class='panel panel-default'>" +
        "<div class='panel-heading'>Change Password</div>" +
        "<div id='changePasswordPanel'  class='panel-body'>" +
        "<div id='newPasswordGroup' class='form-group'>" +
        "<label for='newPasswordInput'>New Password:</label>" +
        "<input type='password' class='form-control' id='newPasswordInput'>" +
        "<div id='newPasswordFeedback'></div>" +
        "</div>" +
        "<div id='confirmNewPasswordGroup' class='form-group'>" +
        "<label for='confirmNewPasswordInput'>Confirm New Password:</label>" +
        "<input type='password' class='form-control' id='confirmNewPasswordInput'>" +
        "<div id='confirmNewPasswordFeedback'></div>" +
        "</div>" +
        "<button class='btn btn-primary' type='submit' id='changePasswordButton'>Change Password</button>" +
        "<br><br>" +
        "<div id='changePasswordFeedback'></div>" +
        "</div>" +
        "</div>"
    ).appendTo(pageContentSelector);
}

$(document).on("click", "#changePasswordButton", function() {

    var invalidField = false;
    var newPasswordFeedbackSelector = $("#newPasswordFeedback");
    var confirmPasswordFeedbackSelector = $("#confirmNewPasswordFeedback");
    var newPasswordGroupSelector = $("#newPasswordGroup");
    var confirmPasswordGroupSelector = $("#confirmNewPasswordGroup");
    newPasswordFeedbackSelector.html("");
    confirmPasswordFeedbackSelector.html("");
    var password = $("#newPasswordInput").val();
    var confirmPassword = $("#confirmNewPasswordInput").val();

    //PASSWORD CHECKS
    if(password === ""){
        console.log("Password is Blank");
        newPasswordGroupSelector.removeClass("form-group has-success").addClass("form-group has-error");
        newPasswordFeedbackSelector.append("<p class='text-danger'>Password can't be blank</p>");
        invalidField = true;
    } else {
        newPasswordGroupSelector.removeClass("form-group has-error").addClass("form-group has-success");
    }

    if(password.length < 8 ){
        console.log("Password needs to be 8 characters or longer");
        newPasswordGroupSelector.removeClass("form-group has-success").addClass("form-group has-error");
        newPasswordFeedbackSelector.append("<p class='text-danger'>Password has to be 8+ characters</p>");
        invalidField = true;
    } else {
        newPasswordGroupSelector.removeClass("form-group has-error").addClass("form-group has-success");
    }

    /**
     * @param password.includes          Whether password contains the digit or not
     */

    var passwordContainsNumbers = false;
    for(var digit = 0; digit < 10; digit++) {
        passwordContainsNumbers = password.includes(digit);
        if (passwordContainsNumbers === true) {
            break;
        }
    }
    if(!passwordContainsNumbers){
        console.log("Password must contain numbers");
        newPasswordGroupSelector.removeClass("form-group has-success").addClass("form-group has-error");
        newPasswordFeedbackSelector.append("<p class='text-danger'>Password must contain at least 1 number</p>");
        invalidField = true;
    } else {
        newPasswordGroupSelector.removeClass("form-group has-error").addClass("form-group has-success");
    }

    //CONFIRM PASSWORD CHECKS
    if(confirmPassword !== password){
        console.log("Confirm Password must match Password");
        confirmPasswordGroupSelector.removeClass("form-group has-success").addClass("form-group has-error");
        confirmPasswordFeedbackSelector.append("<p class='text-danger'>Confirm Password must match Password</p>");
        invalidField = true;
    } else {
        confirmPasswordGroupSelector.removeClass("form-group has-error").addClass("form-group has-success");
    }

    var changePasswordFeedbackSelector = $("#changePasswordFeedback");
    if(invalidField){
        changePasswordFeedbackSelector.append("<p class='text-danger'>Error in inputs, please review and try again!</p>");
    } else {
        changePasswordFeedbackSelector.append("<p class='text-success'>All fields valid, updating password...</p>");
        var updateSuccess = updatePassword(password);
        if(updateSuccess) {
            changePasswordFeedbackSelector.append("<p class='text-success'>Password changed successfully, redirecting to login page...</p>");
            window.setTimeout(function() {
                localStorage.removeItem("resetToken");
                window.open("/loginAndRegister.html","_self")
            }, 3000);
        } else {
            changePasswordFeedbackSelector.append("<p class='text-danger'>Error changing password due to token authentication, please refresh and try again</p>");
        }
    }

});

function updatePassword(password){

    var testToken = getTokenFromURL();
    var tokenValid = false;
    if (testToken === localStorage.resetToken){
        tokenValid = true;
    }

    if(!tokenValid){
        return false;
    }

    $.getJSON("/getResetTokens", function(jsonData) {

        var username = null;

        for(var i = 0; i < jsonData.length; i++) {
            var tokenData = jsonData[i];
            if(tokenData.resetToken === testToken){
                username = tokenData.username;
                break;
            }
        }

        var passwordsha1 = $.ajax({
            url: "/sha1",
            data: {string: password},
            async: false
        }).responseText;

        var updateData = {username: username, field: "passwordsha1", newValue: passwordsha1};

        $.ajax({
            type: "POST",
            url: "/editUser",
            data: updateData,
            dataType: "json"
        });

        $.ajax({
            type: "POST",
            url: "/deleteResetToken",
            data: {resetToken: testToken},
            dataType: "json"
        });

    });

    return true;
}
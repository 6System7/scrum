function sendPostData() {
    var formData = JSON.stringify($("#frmPost").serializeArray());
    console.log(formData);
}

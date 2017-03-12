function sendPostData() {
    // TODO valiate inputs
    // TODO actually upload chosen image and make it storable in database
    
    var formData = $("#frmPost").serializeArray();
    $('#frmPost').find("input[type=text], textarea").val("");
    $('#frmPost').find("input[type=file]").val("");

    var indexedArray = {};

    $.map(formData, function(n, i) {
        indexedArray[n['name']] = n['value'];
    });

    $.ajax({
        type: "POST",
        url: "/addPost",
        data: indexedArray,
        dataType: "json",
        success: function(data) {
            console.log("Success when posting");
        },
        error: function() {
            console.log("Failed when posting");
        }
    });
}

// quagga.js for barcode

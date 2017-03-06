function sendPostData() {
    var formData = $("#frmPost").serializeArray();
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
            //var obj = jQuery.parseJSON(data);
        },
        error: function() {
            console.log("Failed when posting");
        }
    });
}

// quagga.js for barcode

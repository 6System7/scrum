function sendPostData() {
    // TODO valiate inputs
    // TODO actually upload chosen image and make it storable in database

    var formData = $("#frmPost").serializeArray();
    $("#frmPost").find("input[type=text], textarea").val("");
    $("#frmPost").find("input[type=file]").val("");

    var indexedArray = {};

    $.map(formData, function(n, i) {
        indexedArray[n['name']] = n['value'];
    });
    indexedArray.img = $("#frmPost").find("input[type=file]").val();

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

function previewFile() { // TODO test
    var preview = $("#imgPreview");
    var file = document.querySelector("input[type=file]").files[0];
    var reader = new FileReader();

    reader.onloadend = function() {
        preview.attr("src", reader.result);
    }

    if (file) {
        reader.readAsDataURL(file); //reads the data as a URL
    } else {
        preview.attr("src", "");
    }
}

$(document).ready(function() {
    $("input:file").change(function() {
        previewFile();
    });
});

// TODO quagga.js for barcode

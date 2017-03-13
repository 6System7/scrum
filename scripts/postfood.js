var dataURLToBlob = function(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], {
            type: contentType
        });
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {
        type: contentType
    });
}

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
    indexedArray.img = $("#imgPreview").attr("src");
    $("#imgPreview").attr("src", "");

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
        var image = new Image();
        image.onload = function() {
            // Resize image down to 200x200 maximum
            var canvas = document.createElement('canvas'),
                max_size = 200,
                width = image.width,
                height = image.height;
            if (width > height) {
                if (width > max_size) {
                    height *= max_size / width;
                    width = max_size;
                }
            } else {
                if (height > max_size) {
                    width *= max_size / height;
                    height = max_size;
                }
            }
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(image, 0, 0, width, height);
            var dataUrl = canvas.toDataURL('image/jpeg');
            var resizedImage = dataURLToBlob(dataUrl);

            preview.attr("src", dataUrl);
        }
        image.src = reader.result;
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

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

function validInputs() {
    var valid = true;
    $("#frmPost :input[type=text], textarea").each(function() {
        if (valid) {
            if ($.trim($(this).val()) == "" && $(this).attr("readonly") != "yes") {
                valid = false;
                // TODO nicer alert?
                alert($(this).attr("data-hr") + " cannot be empty!");
            }
        }
    });
    if (valid && !marker) {
        valid = false;
        alert("Please select a pick-up location!");
    }
    if (valid && !imageSelected) {
        valid = false;
        alert("Please upload an image of your item!");
    }
    return valid;
}

function sendPostData() {
    if (validInputs()) {

        var formData = $("#frmPost").serializeArray();
        $("#frmPost").find("input[type=text], textarea").val("");
        $("#frmPost").find("input[type=file]").val("");

        var indexedArray = {};
        $.map(formData, function(n, i) {
            indexedArray[n['name']] = n['value'];
        });
        indexedArray.img = $("#imgPreview").attr("src");
        $("#imgPreview").attr("src", "");
        indexedArray.latitude = marker.getPosition().lat();
        indexedArray.longitude = marker.getPosition().lng();

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
}

function previewFile() {
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

function initMap(lat, lng) {

    //The center location of our map. DURHAM IS 54.775250, -1.584852
    var centerOfMap = new google.maps.LatLng(lat, lng);

    //Map options.
    var options = {
        center: centerOfMap, //Set center.
        zoom: 14 //The zoom value.
    };

    //Create the map object.
    map = new google.maps.Map(document.getElementById('map'), options);
    marker = new google.maps.Marker({
        position: centerOfMap,
        map: map,
        draggable: true
    });
    markerLocation();

    //Listen for any clicks on the map.
    google.maps.event.addListener(map, 'click', function(event) {
        //Get the location that the user clicked.
        var clickedLocation = event.latLng;
        //If the marker hasn't been added.
        if (marker === false) {
            //Create the marker.
            marker = new google.maps.Marker({
                position: clickedLocation,
                map: map,
                draggable: true //make it draggable
            });
            //Listen for drag events!
            google.maps.event.addListener(marker, 'dragend', function(event) {
                markerLocation();
            });
        } else {
            //Marker has already been added, so just change its location.
            marker.setPosition(clickedLocation);
        }
        markerLocation();
    });
}

function markerLocation() {
    //Get location.
    var currentLocation = marker.getPosition();
    //Add lat and lng values to a field that we can save.
    document.getElementById('lat').value = currentLocation.lat(); //latitude
    document.getElementById('lng').value = currentLocation.lng(); //longitude
}

google.maps.event.addDomListener(window, 'load', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
            initMap(pos.coords.latitude, pos.coords.longitude);
        });
    } else {
        initMap(54.775250, -1.584852);
    }
});

var imageSelected = false;
var map; //Will contain map object.
var marker = false;

$(document).ready(function() {
    $("input:file").change(function() {
        imageSelected = true;
        previewFile();
    });
});

// TODO quagga.js for barcode

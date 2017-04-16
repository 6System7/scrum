function scanBarcode() {
    if ($("#pnlBarcodeScreen").css("display") == "none") {
        $("#pnlBarcodeScreen").show();
        $("#btnScanBarcode").hide();
        $("#btnScanBarcode").text("Stop Scanning");

        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
            var resultCollector = Quagga.ResultCollector.create({
                capture: true,
                capacity: 20,
                blacklist: [{
                    code: "2167361334",
                    format: "i2of5"
                }],
                filter: function(codeResult) {
                    // only store results which match this constraint
                    // e.g.: codeResult
                    return true;
                }
            });
            var App = {
                init: function() {
                    var self = this;

                    Quagga.init(this.state, function(err) {
                        if (err) {
                            return self.handleError(err);
                        }
                        //Quagga.registerResultCollector(resultCollector);
                        App.attachListeners();
                        Quagga.start();
                    });
                },
                handleError: function(err) {
                    console.log(err);
                },
                initCameraSelection: function() {
                    var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();

                    return Quagga.CameraAccess.enumerateVideoDevices()
                        .then(function(devices) {
                            function pruneText(text) {
                                return text.length > 30 ? text.substr(0, 30) : text;
                            }
                            var $deviceSelection = document.getElementById("deviceSelection");
                            while ($deviceSelection.firstChild) {
                                $deviceSelection.removeChild($deviceSelection.firstChild);
                            }
                            devices.forEach(function(device) {
                                var $option = document.createElement("option");
                                $option.value = device.deviceId || device.id;
                                $option.appendChild(document.createTextNode(pruneText(device.label || device.deviceId || device.id)));
                                $option.selected = streamLabel === device.label;
                                $deviceSelection.appendChild($option);
                            });
                        });
                },
                attachListeners: function() {
                    var self = this;

                    self.initCameraSelection();
                    $(".controls").on("click", "button.stop", function(e) {
                        e.preventDefault();
                        Quagga.stop();
                        self._printCollectedResults();
                    });

                    $(".controls .reader-config-group").on("change", "input, select", function(e) {
                        e.preventDefault();
                        var $target = $(e.target),
                            value = $target.attr("type") === "checkbox" ? $target.prop("checked") : $target.val(),
                            name = $target.attr("name"),
                            state = self._convertNameToState(name);

                        console.log("Value of " + state + " changed to " + value);
                        self.setState(state, value);
                    });
                },
                _printCollectedResults: function() {
                    var results = resultCollector.getResults(),
                        $ul = $("#result_strip ul.collector");

                    results.forEach(function(result) {
                        var $li = $('<li><div class="thumbnail"><div class="imgWrapper"><img /></div><div class="caption"><h4 class="code"></h4></div></div></li>');

                        $li.find("img").attr("src", result.frame);
                        $li.find("h4.code").html(result.codeResult.code + " (" + result.codeResult.format + ")");
                        $ul.prepend($li);
                    });
                },
                _accessByPath: function(obj, path, val) {
                    var parts = path.split('.'),
                        depth = parts.length,
                        setter = (typeof val !== "undefined") ? true : false;

                    return parts.reduce(function(o, key, i) {
                        if (setter && (i + 1) === depth) {
                            if (typeof o[key] === "object" && typeof val === "object") {
                                Object.assign(o[key], val);
                            } else {
                                o[key] = val;
                            }
                        }
                        return key in o ? o[key] : {};
                    }, obj);
                },
                _convertNameToState: function(name) {
                    return name.replace("_", ".").split("-").reduce(function(result, value) {
                        return result + value.charAt(0).toUpperCase() + value.substring(1);
                    });
                },
                detachListeners: function() {
                    $(".controls").off("click", "button.stop");
                    $(".controls .reader-config-group").off("change", "input, select");
                },
                setState: function(path, value) {
                    var self = this;

                    if (typeof self._accessByPath(self.inputMapper, path) === "function") {
                        value = self._accessByPath(self.inputMapper, path)(value);
                    }

                    self._accessByPath(self.state, path, value);

                    console.log(JSON.stringify(self.state));
                    App.detachListeners();
                    Quagga.stop();
                    App.init();
                },
                inputMapper: {
                    inputStream: {
                        constraints: function(value) {
                            if (/^(\d+)x(\d+)$/.test(value)) {
                                var values = value.split('x');
                                return {
                                    width: {
                                        min: parseInt(values[0])
                                    },
                                    height: {
                                        min: parseInt(values[1])
                                    }
                                };
                            }
                            return {
                                deviceId: value
                            };
                        }
                    },
                    numOfWorkers: function(value) {
                        return parseInt(value);
                    },
                    decoder: {
                        readers: function(value) {
                            if (value === 'ean_extended') {
                                return [{
                                    format: "ean_reader",
                                    config: {
                                        supplements: [
                                            'ean_5_reader', 'ean_2_reader'
                                        ]
                                    }
                                }];
                            }
                            return [{
                                format: value + "_reader",
                                config: {}
                            }];
                        }
                    }
                },
                state: {
                    inputStream: {
                        type: "LiveStream",
                        constraints: {
                            width: {
                                min: 640
                            },
                            height: {
                                min: 480
                            },
                            facingMode: "environment",
                            aspectRatio: {
                                min: 1,
                                max: 2
                            }
                        }
                    },
                    locator: {
                        patchSize: "medium",
                        halfSample: true
                    },
                    numOfWorkers: 4,
                    decoder: {
                        readers: [
                            "code_128_reader",
                            "ean_reader",
                            "upc_reader",
                            "upc_e_reader"
                        ],
                        debug: {
                            drawBoundingBox: false
                        }
                    },
                    locate: true
                },
                lastResult: null
            };

            App.init();

            Quagga.onProcessed(function(result) {});

            Quagga.onDetected(function(result) {
                var code = result.codeResult.code;

                if (App.lastResult !== code) {
                    App.lastResult = code;
                    var $node = null,
                        canvas = Quagga.canvas.dom.image;
                    alert("New code found " + code); // TODO Mike - GET INFO FROM OPEN FOOD FACTS API AND FILL FORM
                }
            });
        } else {
            var alertDiv = $("<div>");
            alertDiv.addClass("alert alert-warning alert-dismissible");
            alertDiv.attr("role", "alert");
            alertDiv.css("width", "80%");
            alertDiv.css("margin", "0 auto");
            var closeButton = $("<button>");
            closeButton.addClass("btn btn-primary");
            closeButton.attr("data-dismiss", "alert");
            closeButton.text("Dismiss");
            closeButton.css("float", "right");
            closeButton.click(function() {
                $("#pnlBarcodeScreen").hide();
            });
            alertDiv.append(closeButton);
            alertDiv.append("<strong>Woops!</strong> Your browser does not support giving us access to your media devices!")
            $("#pnlBarcodeScreen").empty();
            $("#pnlBarcodeScreen").append(alertDiv);
        }
    } else {
        $("#pnlBarcodeScreen").hide();
        $("#btnScanBarcode").show();
        $("#btnScanBarcode").text("Scan Barcode");
    }
}

function validInputs() {
    // TODO Maddy? - nicer alerts in this section?

    var valid = true;
    $("#frmPost :input[type=text], textarea").each(function() {
        if (valid) {
            if ($.trim($(this).val()) == "" && $(this).attr("readonly") != "yes") {
                valid = false;
                alert($(this).attr("data-hr") + " cannot be empty!");
            }
        }
    });
    if (valid && !marker) {
        valid = false;
        alert("Please select a pick-up location!");
    }
    // if (valid && !imageSelected) { // NOTE spec says 'optional image' so maybe leave commented
    //     valid = false;
    //     alert("Please upload an image of your item!");
    // }
    return valid;
}

function sendPostData() {
    if (validInputs()) {
        var formData = $("#frmPost").serializeArray();
        $("#frmPost").find("input[type=text], textarea").val("");
        $("#frmPost").find("input[type=file]").val("");

        var indexedArray = {};
        $.map(formData, function(n, i) {
            var key = n['name'];
            if (key.endsWith("[]")) {
                // Serialise dietary requirements as array correctly
                key = key.substring(0, key.length - 2);
                // If array exists, append, else create with one entry
                if (indexedArray[key]) {
                    indexedArray[key].push(n['value']);
                } else {
                    indexedArray[key] = [n['value']];
                }
            } else {
                indexedArray[key] = n['value'];
            }
        });

        indexedArray.image = $("#imgPreview").attr("src");
        if (imageSelected) {
            indexedArray.saveImage = true;
        }
        // $("#imgPreview").attr("src", "");

        if (marker) {
            indexedArray.latitude = marker.getPosition().lat();
            indexedArray.longitude = marker.getPosition().lng();
        }

        if (localStorage.username) {
            indexedArray.username = localStorage.username;
        } else {
            alert("WARNING - SUBMITTING WHILE NOT LOGGED IN");
        }

        // @Mike, I Added saving location here as googleApi wasn't accessible from index.js

        var geocoder = new google.maps.Geocoder;
        var latlng = {
            lat: indexedArray.latitude,
            lng: indexedArray.longitude
        };

        geocoder.geocode({
            'location': latlng
        }, function(results, status) {
            if (status === 'OK') {
                if (results[1]) {
                    indexedArray.location = results[1].address_components[1].long_name; // City
                    //indexedArray.location = results[1].address_components[3].long_name; // County
                }
            }

            if (postID) {
                indexedArray._id = postID;
            }
            localStorage.removeItem("postToEdit");

            // console.log("Submitting post as follows", indexedArray);
            $.ajax({
                type: "POST",
                url: "/addPost",
                data: {
                    postToPost: indexedArray
                },
                dataType: "json",
                success: function(data) {
                    // console.log("Success when posting");
                },
                error: function() {
                    // NOTE commented out because refreshing the page below causes this to 'fail' when it doesn't
                    // console.log("Failed when posting");
                    // alert("Could not add post\nPlease try again soon!");
                }
            });

            // IF EDITING, GO BACK TO MANAGEMENT
            if (postID) {
                postID = false;
                window.location.replace("/postManagement.html");
            } else { // IF ADDING, ALLOW FOR MORE ADDING
                // NOTE THIS IS TO CLEAR THE UNCLEARABLE INPUT, AND TO ENSURE THE LOCATION INPUTS ARE NOT EMPTY, ETC
                location.reload();
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
            // Resize image down
            var canvas = document.createElement('canvas'),
                max_size = 380,
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
    $("#lat").val(currentLocation.lat()); //latitude
    $("#lng").val(currentLocation.lng()); //longitude
}

google.maps.event.addDomListener(window, 'load', function() {
    navigator.geolocation.getCurrentPosition(function(pos) {
        initMap(pos.coords.latitude, pos.coords.longitude);
    }, function(error) {
        initMap(54.77525, -1.584852);
        // alert("Could not get your location, defaulting to Durham");
    });
});

var imageSelected = false;
var map; //Will contain map object.
var marker = false;
var postID;

$(document).ready(function() {
    $("#pnlBarcodeScreen").hide();

    $("#btnStopBarcodeScanning").click(function() {
        $("#pnlBarcodeScreen").hide();
        $("#btnScanBarcode").show();
        $("#btnScanBarcode").text("Scan Barcode");
    });

    $("input:file").change(function() {
        imageSelected = true;
        previewFile();
    });

    if (localStorage.postToEdit) {
        $("#pageTitleH1").text("Edit a food item");
        // console.log(localStorage.postToEdit);
        var post = JSON.parse(localStorage.postToEdit);
        postID = post._id;

        $("#txtTitle").val(post.title);
        $("#txtDescription").val(post.description);
        initMap(Number(post.latitude), Number(post.longitude));
        $("#imgPreview").attr("src", post.image);
        if (post.business) {
            $("#chkBusiness").prop("checked", true);
        }
        if (post.collection) {
            $("#chkCollectionOnly").prop("checked", true);
        }
        if (post.mealTypeDietary) {
            for (var i = 0; i < post.mealTypeDietary.length; i++) {
                if (post.mealTypeDietary[i] === "glutenfree") {
                    $("#chkGlutenFree").prop("checked", true);
                } else if (post.mealTypeDietary[i] === "vegan") {
                    $("#chkVegan").prop("checked", true);
                } else if (post.mealTypeDietary[i] === "vegetarian") {
                    $("#chkVegetarian").prop("checked", true);
                } else if (post.mealTypeDietary[i] === "nutfree") {
                    $("#chkNutFree").prop("checked", true);
                } else if (post.mealTypeDietary[i] === "fishfree") {
                    $("#chkFishFree").prop("checked", true);
                }
            }
        }
        if (post.mealtype) {
            $("#slcMealType").val(post.mealtype);
        }
        if (post.mealtypecountry) {
            $("#slcMealTypeCountry").val(post.mealtypecountry);
        }
        if (post.mealtypefood) {
            $("#slcMealTypeFood").val(post.mealtypefood);
        }
        if (post.mealweight) {
            $("#slcMealWeight").val(post.mealweight);
        }
        if (post.mealexpires) {
            $("#slcMealExpires").val(post.mealexpires);
        }
        localStorage.removeItem("postToEdit");
    } else {
        postID = false;
    }
});

// TODO Mike - https://en.wiki.openfoodfacts.org/API Open Food Facts API for barcode -> product information for auto fill of form data

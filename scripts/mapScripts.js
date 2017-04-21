var mymap;
navigator.geolocation.getCurrentPosition(function(pos) {
        initialiseMapLocation(pos.coords.latitude, pos.coords.longitude);
    }, function(error) {
        initialiseMapLocation(54.767230, -1.570390); // <--- school of engineering // center of durham --> 54.77525, -1.584852
    });

function initialiseMapLocation(myLat, myLong) {
    mymap = L.map('mapid').setView([myLat, myLong], 13); // zoom 13 for general view, zoom 18 for building specific
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 20,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(mymap);
}

function setUp() {
    var id = [];
    var lat = [];
    var lon = [];
    var type = [];
    var foodType = [];
    var foodCountry = [];
    var description = [];
    $.ajax({
        url: "/getPosts",
        type: "GET",
        dataType: "json",
        success: function(data) {
            var toPrint = 0;
            var i = 0;
            var c = 0;
            var j = 0;
            mapData = localStorage.getItem("GetData");
            allData = JSON.parse(JSON.stringify(data));
            parsed = JSON.parse(mapData);
            for (var j = 0; j < allData.length; j++) {
                var x = allData[j];
                for (i in mapData) {
                    if ((x._id).toString() == parsed[i]) {
                        id[c] = x._id;
                        lat[c] = x.latitude;
                        lon[c] = x.longitude;
                        type[c] = x.title;
                        foodType[c] = x.mealtypefood;
                        foodCountry[c] = x.mealtypecountry;
                        description[c] = x.description;
                        c = c + 1;
                    }
                }
            }
            if (lat.length != 0) {
                placePointer(id, lat, lon, type, foodType, foodCountry, description);
            }
        }
    });
    return;
}

function placePointer(id, x, y, type, fType, fCountry, desc) {
    var i;
    var markers = new L.LayerGroup();
    markers.clearLayers();
    markers.addTo(mymap);
    console.log(x, y);
    for (i = 0; i < x.length; i++) {
        marker = new L.marker([x[i], y[i]]).bindPopup(

            "<b>" + type[i] + "</b>"+ "<br>" + "Type of food: " +  fType[i] + ", " + fCountry[i] + "<br>" + "Further Details: " + desc[i] + "<br> <a onclick='window.parent.openModal(\"" + id[i].toString() +"\")' href='#'> See More! </a>");
        markers.addLayer(marker);
    }
    return;
}

function clearMap() {
    mymap.removeLayer(markers);
    return;
}

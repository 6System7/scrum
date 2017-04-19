var mymap = L.map('mapid').setView([54.77, -1.57], 13);
			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
				maxZoom: 20,
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + 
					'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
					'Imagery © <a href="http://mapbox.com">Mapbox</a>',
				id: 'mapbox.streets'
			}).addTo(mymap);
function setUp(){
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
	success: function(data){
	var toPrint = 0;
	var i = 0;
	var c = 0;
	var j = 0;
	mapData = localStorage.getItem("GetData");
    allData = JSON.parse(JSON.stringify(data));
	parsed = JSON.parse(mapData);
		for(var j=0; j < allData.length; j++) {
			var x = allData[j];
            for (i in mapData){
				if ((x._id).toString() == parsed[i]){
				lat[c] = x.latitude;
				lon[c] = x.longitude;
				type[c] = x.mealtype;
				foodType[c] = x.mealtypefood;
				foodCountry[c] = x.mealtypecountry;
				description[c] = x.description;
				c = c+1;
				}
			}	
		}
	if (lat.length != 0){
	placePointer(lat,lon,type,foodType, foodCountry, description);
	}
	}
	});
	return;
	}
	
	function placePointer(x,y,type,fType,fCountry,desc){
		var i;
		var markers = new L.LayerGroup();
		markers.clearLayers();
		markers.addTo(mymap);
		console.log(x,y);
		for (i =0; i < x.length; i++){
			marker = new L.marker([x[i],y[i]]).bindPopup("Meal Type: " + type[i] +
			"<br>" + "Type of food: " +	fType[i] +
			", " + fCountry[i] +
			"<br>" + "Further Details: " +	desc[i]);
			markers.addLayer(marker);
			}
		return;
	}
		
	function clearMap(){
		mymap.removeLayer(markers);
		return;
	}
	
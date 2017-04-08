$(document).ready(function(){
    var dataPass;
    getNotifications();
    $.ajax({
        url: "/getPosts",
        type: "GET",
        dataType: "json",
        success: function(data){
            var foodsToShow = []
            var dataReturned = JSON.parse(JSON.stringify(data));
            dataPass = dataReturned;
            getPostedFoods(dataReturned);
            for(var property=0; property < dataReturned.length; property++) {
                var size = 0;
                var x = dataReturned[property];
                foodsToShow.push((x._id).toString());
            }
            getPostedFoods(foodsToShow);
        }
    });
    $("#btnUpdate").click(function(){
    // TODO
        var foodsToPost = filterFoods(dataPass);
        getPostedFoods(foodsToPost);
    });
})

    // include parameter for when to do this??
    // Maybe by lenth? List of all thingys? array of all inputs
           /*
           initially pass all data as the length should be right?
           
           Otherwise call filter and then append all that pass and then can check against? All will be cross checked against Id
           
           */

function getPostedFoods(x){
    $("#column0").html("");
     $("#column1").html("");
     $("#column2").html("");

    var checkArray = x;
    var dataReturned;
    $.ajax({
        url: "/getPosts",
        type: "GET",
        dataType: "json",
        success: function(data){
            var toPrint = 0;
            dataReturned = JSON.parse(JSON.stringify(data));
            for(var property=0; property < dataReturned.length; property++) {
                var x = dataReturned[property];
                for (y in checkArray){
                    if ((x._id).toString() == checkArray[y]){
                        toPrint++;
                         // CREATE CARD 
                        var divEl = $('<div>');
                        divEl.addClass("w3-card-4");

                        // CREATE IMAGE
                        var img2 = $('<img>');
                        var img = (x.image).toString();
                        if (img == ""){
                            img2 = $('<div>');
                            img2.addClass("text-center");
                            var info = "<br><span class = 'glyphicon glyphicon-picture'></span>";
                            $("<br><span class = 'glyphicon glyphicon-picture'></span>").appendTo(img2);   
                        }
                        img2.attr("src",(x.image).toString());
                        img2.attr("object-fit", "contain");
                        img2.attr("width", "auto");
                        img2.attr("max-height", "160px");
                        img2.appendTo(divEl);

                        // CREATE CONTAINER
                        var container = $('<div>');
                        container.addClass("w3-container w3-center");
                        container.appendTo(divEl);

                        // CREATE TITLE
                        var titleCon = $('<h4>')
                        titleCon.text((x.title).toString());
                        titleCon.appendTo(container);

                        // CREATE DESCRIPTION & AUTHOR
                        var bodyCon = $("<p>");
                        bodyCon.text(x.description);
                        var authorCon = "<br><small class = 'text-muted'><i>" + x.username + "</i></small>";
                        bodyCon.append(authorCon);
                        bodyCon.appendTo(container);

                        // CALCULATE COLUMN
                        colNum = toPrint-1;
                        colNum = colNum % 3;
                        var str = "#column" + colNum.toString();
                        $(str ).append(divEl);
                        (divEl).after("<br>");
                    }
                }
            }
        }
    })
} 

// creates a list of ids of posts which can then be passed to the printer
function filterFoods(dataPass){
    var data = dataPass;
    foodsToPost = []
    var filters = loadFilters();
    for (var foodPostElem = 0; foodPostElem < data.length; foodPostElem++){
        var visibility = false;
        var foodPost = dataPass[foodPostElem];
        // alert(foodPost._id); prints alert
        var dist = calculateDistance(foodPost.latitude, foodPost.longitude);
        console.log(parseInt(dist) <= filters.distance);
        console.log(dist);
        if (parseInt(dist) <= filters.distance){
            for (var category = 0; category < Object.keys(filters).length; category++){
                
                //  alert(Object.keys(filters)[category]); // mealtype
                /*
                var postCheck = foodPost.mealtype;
                 THIS WORKS BUT CAN'T HAVE MEALTYPE'*/ 
                var postCheck = foodPost[Object.keys(filters)[category]];
                var xox = filters[Object.keys(filters)[category]];
                //alert(xox[0]);  /// e.g breakfast
                for (var listInCategory = 0; listInCategory < xox.length; listInCategory++){
                    if (xox[listInCategory] == postCheck){
                        visibility = true;
                    }
                } 
            }
            if (visibility == true){
                foodsToPost.push(foodPost._id);
            }

        }
    }
    return foodsToPost;
}
   
// Grabs the possible filters
function loadFilters(){
    var filters =  {
        /* collection only and business?
        dietary requirements, keywords, distance TODO        
        */
        mealtype: " ",
        mealtypecountry: " ",
        mealtypefood: " ",
        mealsizeweight: " ",
        mealexpires: " ",
        mealTypeDietary: " ", //captails??  
        collectionbusiness: " ",
        distance: " "
    };
    
    
    // MEAL TYPE
    var mealtypeList = [];
    $("#collapseMealType input:checked").each(function(){
      
        mealtypeList.push($(this).attr('name'))
        
    })
    // put in mealtype if its not empty?? TODO
    filters["mealtype"] = mealtypeList;
    
    // MEAL TYPE COUNTRY
    var mealtypecountrylist = [];
    $("#collapseTypeCountry input:checked").each(function(){
            mealtypecountrylist.push($(this).attr('value'))
    })
    filters["mealtypecountry"] = mealtypecountrylist;
    
    // MEAL TYPE FOOD
    var mealtypefoodlist = [];
    $("#collapseTypeOfFood input:checked").each(function(){
            mealtypefoodlist.push($(this).attr('value'))
    })
    filters["mealtypefood"] = mealtypefoodlist;
    
    // SIZE / WEIGHT
    var sizeweightlist = [];
    $("#collapseSizeWeight input:checked").each(function(){
            sizeweightlist.push($(this).attr('value'))
    })
    filters["mealsizeweight"] = sizeweightlist;
    
    // EXPIRATION DATE
    var mealexpireslist = [];
    $("#collapseExpirationDate input:checked").each(function(){
            mealexpireslist.push($(this).attr('value'))
    })
    filters["mealexpires"] = mealexpireslist;
    
    // COLLECTION AND BUSINESS
    var collectionbusinesslist = [];
    $("#collapseCollectionOnly input:checked").each(function(){
            collectionbusinesslist.push($(this).attr('value'))
    })
    filters["collectionbusiness"] = mealexpireslist;
    
    // DIETARY REQUIREMENTS
    var mealtypedietarylist = [];
    $("#collapseDietryRequirements input:checked").each(function(){
            mealtypedietarylist.push($(this).attr('value'))
    })
    filters["mealTypeDietary"] = mealtypedietarylist;
    
    // DISTANCE AWAY:
    var distanceAwayKm = $("#trcDistanceSlider").val();
    filters["distance"] = distanceAwayKm;

    return filters;
} 

function updateSlider(slideValue){
    document.getElementById("distLabel").innerHTML = "Search radius(km): " + slideValue;
}

function sortColumn(colToSortId){
    if (colToSortId == "colDistance"){     
    }
}

function calculateDistance(latitude, longitude){

    var memberLang = 0;
    var memberLong = 0;
    var lat = latitude;
    var long = longitude;
    // check they want to use this location not another one TODO
    if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                memberLang = pos.coords.latitue;
                memberLong = pos.coords.longitude;
            });
        } else {
            memberLang = 54.775250;
            memberLong = -1.584852;
            
    }
    dist = getDistanceFromLatLonInKm(memberLang, memberLong, lat, long).toFixed(1);
    return dist;
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

// TODO eventually move notifications into global functions? 
// TODO has to loop every noe and then. Set timer??

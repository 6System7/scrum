$(document).ready(function(){
    var dataPass;
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
        var foodsToPost = filterFoods(dataPass);
        if (foodsToPost.length == 0){
            $("#column0").html("");
            $("#column1").html("");
            $("#column2").html("");
            divEl = "<div ><img src = 'sorry.png'><br><br><h5><i><b> No posts match your search</b></i> </h5></div>"
            $("#column1").append(divEl);
        }
        else {
            getPostedFoods(foodsToPost);
        }
    });
    $("#btnClearAll").click(function(){
        clearAll();
    })
})

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
                        var imgDiv = $('<div>');
                        imgDiv.addClass("text-center");
                        var img2 = $('<img>');
                        img = (x.image).toString();
                        if (img == ""){
                            img2 = $('<span>');
                            img2.addClass("glyphicon glyphicon-picture");
                            img2.attr("style","margin-top:20px");
                        }
                        else{
                            img2.attr("src",(x.image).toString());
                            img2.addClass("center");
                            img2.attr("style", "height:160px; width:auto")
                        }
                        img2.appendTo(imgDiv);
                        imgDiv.appendTo(divEl);

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

// Create's a array of IDs: these posts will be displayed
function filterFoods(dataPass){
    var data = dataPass;
    foodsToPost = []
    var filters = loadFilters();
    for (var foodPostElem = 0; foodPostElem < data.length; foodPostElem++){
        var visibility = false;
        var foodPost = dataPass[foodPostElem];  //alert(foodPost._id);  
        
        // CALCULATE DISTANCE AND CHECK ITS CORRECT
        var dist = calculateDistance(foodPost.latitude, foodPost.longitude);
        if (parseInt(dist) <= filters.distance){ 
            
            // COMPARE DESCRIPTION AND KEYWORDS
            var description = foodPost.description;
            description = description.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").toLowerCase();
            var filterDesc = filters.description;
            console.log(foodPost.title);
            for (var word = 0; word< filterDesc.length; word++){
                
                var wordStr = (filterDesc[word]);
                if (description.indexOf(wordStr) !== -1){
                    visibility = true;     
                }
            }
            
            for (var category = 0; category < Object.keys(filters).length; category++){

            var checkAgain = (Object.keys(filters)[category]).toString();
            var postCheck = foodPost[checkAgain]; //grab it from post
                var xox = filters[Object.keys(filters)[category]]; //alert(xox[0]);  /// e.g breakfast

                
                for (var listInCategory = 0; listInCategory < xox.length; listInCategory++){
                        if (xox[listInCategory] == postCheck){
                                visibility = true;
                            console.log("HEYA");
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
   
// Makes a list of checked filters
function loadFilters(){
    var filters =  {
        /* TODO
        keywords??        
        */
        mealtype: " ",
        mealtypecountry: " ",
        mealtypefood: " ",
        mealweight: " ",
        mealexpires: " ",
        mealTypeDietary: " ", //captails??  
        collectionbusiness: " ",
        distance: " ",
        description: " "
    };
    
    
    // MEAL TYPE
    var mealtypeList = [];
    $("#collapseMealType input:checked").each(function(){
      
        mealtypeList.push($(this).attr('name'))   
    }) // put in mealtype if its not empty?? TODO
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
    filters["mealweight"] = sizeweightlist;
    
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
    
    // KEYWORDS
    var keywords = [];
    var take = $("#txtKeyWord").val()
    if (take != " " || take !=""){
        var punctuationless = take.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").toLowerCase();
        keywords = punctuationless.split(" ");
        filters["description"] = keywords;
 
    }
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

function clearAll(){
    $("#txtKeyWord").val(" ");
        $('input:checkbox').prop('checked', false);
}

// TODO eventually move notifications into global functions? 
// TODO has to loop every noe and then. Set timer??

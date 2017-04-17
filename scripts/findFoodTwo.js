var currentLang;
var currentLong;
$(document).ready(function(){
    var dataPass;
    navigator.geolocation.getCurrentPosition(function(pos) {
        currentLang = pos.coords.latitude;
        currentLong = pos.coords.longitude;
       
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
			setStorage(foodsToPost);
            getPostedFoods(foodsToPost);
        }
    });
    $("#btnClearAll").click(function(){
        clearAll();
    })

    //$("#btnSeePosts").click(function(){
   //     $("#seePostsModal").modal('show');
   //     seePost();
   // })
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
                        if(x.collected != "true"){
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
                        var authorCon = "<br><small class = 'text-muted'><i>" + x.username + "</i></small><br>";
                        bodyCon.append(authorCon);
                        bodyCon.appendTo(container);
                        
                        // CREATE SEE BUTTON
                        var seeButton = $("<button>");
                        seeButton.attr("type","button");
                        seeButton.attr("id","seePostBtn");
                        seeButton.addClass("btn btn-default pull-right ");
                        seeButton.data("foodJson",x);
                        seeButton.attr("data-toggle","modal");
                        seeButton.attr("data-target","#seePostsModal");
                        seeButton.click(function() {
                            var foodPost = $(this).data("foodJson");
                            seePost(foodPost);
                                  });
                    
                        var glyph = $("<span>")
                        glyph.addClass("glyphicon glyphicon-eye-open")
                        glyph.appendTo(seeButton);
                        seeButton.appendTo(bodyCon);
                        

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
        }
    })
} 

// Create's a array of IDs: these posts will be displayed
function filterFoods(dataPass){
    var data = dataPass;
    foodsToPost = []
    var filters = loadFilters();
    var whatToPrint = filters.usefilters;
        for (var foodPostElem = 0; foodPostElem < data.length; foodPostElem++){
            var visibility = false;
            var foodPost = dataPass[foodPostElem];   

            // CALCULATE DISTANCE AND CHECK ITS CORRECT
            var dist = calculateDistance(foodPost.latitude, foodPost.longitude);
            if (parseInt(dist) <= filters.distance){
                // TAKE ALL POSTS IN THIS DISTANCE
                
                if (whatToPrint == "false"){
                    visibility = true; 
                    foodsToPost.push(foodPost._id);
                }
                else { 
                // COMPARE DESCRIPTION AND KEYWORDS
                   
                    var description = foodPost.description;
                    description = description.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").toLowerCase();
                    var filterDesc = filters.description;
                    //console.log(foodPost.title);
                    for (var word = 0; word< filterDesc.length; word++){

                        var wordStr = (filterDesc[word]);
                        if (wordStr !=""){

                            if (description.indexOf(wordStr) !== -1){
                                visibility = true; 
                                if (whatToPrint == "falseButdescription"){
                                
                                    foodsToPost.push(foodPost._id);
                                }
                                
                            }
                        }
                    }
                    if (whatToPrint == "true") {
                  
                    for (var category = 0; category < Object.keys(filters).length; category++){

                    var checkAgain = (Object.keys(filters)[category]).toString();
                    var postCheck = foodPost[checkAgain]; //grab it from post
                        var xox = filters[Object.keys(filters)[category]]; 
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
                }}
            
    return foodsToPost;
}
   
// Makes a list of checked filters
function loadFilters(){
    var checkHowMany = 0;
    var filters =  {
        /* TODO
        keywords??        
        */
        usefilters: "true",
        mealtype: " ",
        mealtypecountry: " ",
        mealtypefood: " ",
        mealweight: " ",
        mealexpires: " ",
        mealTypeDietary: " ", //captails??  
        collectionbusiness: " ",
        distance: " ",
        description: "none"
    };
    
    
    // MEAL TYPE
    var mealtypeList = [];
    $("#collapseMealType input:checked").each(function(){
      
        mealtypeList.push($(this).attr('name'))   
    }) // put in mealtype if its not empty?? TODO
    if (mealtypeList.length != 0){
        checkHowMany++
    }    
    filters["mealtype"] = mealtypeList;
    
    // MEAL TYPE COUNTRY
    var mealtypecountrylist = [];
    $("#collapseTypeCountry input:checked").each(function(){
            mealtypecountrylist.push($(this).attr('value'))
    })
    if (mealtypecountrylist.length != 0){
        checkHowMany++
    }
    filters["mealtypecountry"] = mealtypecountrylist;
    
    // MEAL TYPE FOOD
    var mealtypefoodlist = [];
    $("#collapseTypeOfFood input:checked").each(function(){
            mealtypefoodlist.push($(this).attr('value'))
    })
    if (mealtypefoodlist.length != 0){
        checkHowMany++
    }
    filters["mealtypefood"] = mealtypefoodlist;
    
    // SIZE / WEIGHT
    var sizeweightlist = [];
    $("#collapseSizeWeight input:checked").each(function(){
            sizeweightlist.push($(this).attr('value'))
    })
    if (sizeweightlist.length != 0){
        checkHowMany++
    }
    filters["mealweight"] = sizeweightlist;
    
    // EXPIRATION DATE
    var mealexpireslist = [];
    $("#collapseExpirationDate input:checked").each(function(){
            mealexpireslist.push($(this).attr('value'))
    })
    if (mealexpireslist.length != 0){
        checkHowMany++
    }
    filters["mealexpires"] = mealexpireslist;
    
    // COLLECTION AND BUSINESS
    var collectionbusinesslist = [];
    $("#collapseCollectionOnly input:checked").each(function(){
            collectionbusinesslist.push($(this).attr('value'))
    })
    if (collectionbusinesslist.length != 0){
        checkHowMany++
    }
    filters["collectionbusiness"] = mealexpireslist;
    
    // DIETARY REQUIREMENTS
    var mealtypedietarylist = [];
    $("#collapseDietryRequirements input:checked").each(function(){
            mealtypedietarylist.push($(this).attr('value'))
    })
    if (mealtypedietarylist.length != 0){
        checkHowMany++
    }
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
        
    // CHECK WHETHER ANY HAVE VALUES AND IF NO JUST DO DISTANCE
    justDistance = false;
    /*checkHowMany = 0;
    for (var category = 0; category < Object.keys(filters).length; category++){
        if (Object.keys(filters)[category] != "distance" || Object.keys(filters)[category] != "description"){
            if (Object.keys(filters)[category] != " " || Object.keys(filters)[category] != []){
                checkHowMany++
            }
        }
    }*/
  
    if (checkHowMany == 0){
            //justDistance = true;
        if (filters["description"] != "" && filters["description"] != ","){
            filters["usefilters"] = "falseButdescription"; 
        }
        else if (filters["description"] == "," || filters["description"] == ""){
            var fil = "false";
            filters["usefilters"] = fil;
        }
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
    var lat = latitude;
    var long = longitude;
    var dist;
    // check they want to use this location not another one TOD) 
   dist = getDistanceFromLatLonInKm(currentLang, currentLong, lat, long).toFixed(1);
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
    $("#trcDistanceSlider").val("1000");
    $("#distLabel").text("Search radius(km): 1000");
    $("#txtKeyWord").val(" ");
    $('input:checkbox').prop('checked', false);
}

function seePost(x){
    
    // REMOVE PREVIOUS POSTS
    $("#modalLeftColumn").html("");
    $("#modalRightColumn").html("");
    
    // ADD TO TITLE
    $("#modalPostTitle").text(x.title);
    
    /********BODY OF MODAL LEFT COLUMN *********/
    //INSERT IMAGE
    var imgDiv = $('<div>');
    imgDiv.addClass("text-center");
    var img2 = $('<img>');
    img = (x.image).toString();
    console.log(img);
    if (img == ""){
        img2 = $('<span>');
        img2.addClass("glyphicon glyphicon-picture");
        img2.attr("style","margin-top:20px");
    }
    else{
        img2.attr("src",(img));
        img2.addClass("center");
        img2.attr("style", "height:160px; width:auto")
    }
    img2.appendTo(imgDiv);
    $("#modalLeftColumn").append(imgDiv);
    
    //INSERT TYPE BY COUNTRY
    var typeCountry = $('<p>');
    var typeCountryLabel = "<br><i>Country: </i>"
    $("#modalLeftColumn").append(typeCountryLabel);
    typeCountry.text(x.mealtypecountry.toString())
    $("#modalLeftColumn").append(typeCountry);
    
    //INSERT TYPE OF FOOD
    var typeFood = $('<p>');
    var typeFoodLabel = "<br><i>Type of Food: </i>"
    $("#modalLeftColumn").append(typeFoodLabel);
    typeFood.text(x.mealtypefood.toString())
    $("#modalLeftColumn").append(typeFood);
    
    //INSERT SIZE/WEIGHT
    var sizeweight = $('<p>');
    var sizeweightLabel = "<br><i>Size/Weight: </i>"
    $("#modalLeftColumn").append(sizeweightLabel);
    sizeweight.text(x.mealweight.toString());
    $("#modalLeftColumn").append(sizeweight);
    
    
    /********BODY OF MODAL RIGHT COLUMN *********/
    
    //INSERT DESCRIPTION
    var description = $('<p>');
    var descriptionLabel = "<i>Description: </i>"
    $("#modalRightColumn").append(descriptionLabel);
    description.text(x.description);
    $("#modalRightColumn").append(description);
    
    // DIETARY REQUIREMENTS
    var dietaryRequirements = $('<p>');
    var dietaryRequirementsLabel = "<i>Dietary requirements: </i><br>"
    $("#modalRightColumn").append(dietaryRequirementsLabel);
    var add = "";
    if (x.mealTypeDietary == undefined){
        add = "None"
    }
    else{
        for (var thing=0; thing<x.mealTypeDietary.length; thing++){
            if (thing < x.mealTypeDietary.length - 1){
                add += x.mealTypeDietary[thing].toString() + ", ";
            }
            else{
                add += x.mealTypeDietary[thing].toString();
            }
        }
    }
    dietaryRequirements.text(add);
    $("#modalRightColumn").append(add);
   /* 
    //MEAL TYPE
    var mealTypeDiv1 = $('div');
    mealTypeDiv1.addClass("panel panel-default");
    var mealTypeDivHeader = $('div');
    mealTypeDivHeader.addClass("panel-heading");
    mealTypeDivHeader.text("Meal Type");
    //  var mealTypeHeader = ('<h4');
    // mealTypeHeader.text("Meal Type")
    //mealTypeDiv1.append(mealTypeDivHeader);
    var mealTypeDivBody = $('div');
    mealTypeDivBody.addClass("panel-body");
    // var mealTypeHeader = ('<h4');
    //mealTypeHeader.text("Meal Type")
    mealTypeDivBody.text(x.mealtypefood)
    //mealTypeDiv1.append(mealTypeDivBody);
    $("#test").append(mealTypeDiv1);
    
    */
    
   /* <div class="panel-group">
  <div class="panel panel-default">
    <div class="panel-body">Panel Content</div>
  </div>
  <div class="panel panel-default">
    <div class="panel-body">Panel Content</div>
  </div>
</div>*/
   /* var testGroup = $("div");
    testGroup.addClass("panel-group");
    var test= $("div");
    test.addClass("panel panel-primary");
    var test1= $("div");
    test1.addClass("panel-body");
    test1.text("TEST");
    test.append(test1);
    testGroup.append(test);
    $("#modalRightColumn").append(testGroup);
    */
    
    var mealType = $('<p>');
    var mealTypeLabel = "<br><i>Meal Type: </i>"
    mealType.text(x.mealtypefood);
    $("#modalRightColumn").append(mealTypeLabel);
    $("#modalRightColumn").append(mealType);
        
    //DISTANCE AWAY
    var dist = calculateDistance(x.latitude, x.longitude);
    var distance = $('<p>');
    var distanceLabel = "<br><i>Distance Away: </i>"
    distance.text(dist);
    $("#modalRightColumn").append(distanceLabel);
    $("#modalRightColumn").append(distance);

    //LOCATION
    var location = $('<p>');
    var locationLabel = "<br><i>Location: </i>"
    location.text(x.location);
    $("#modalRightColumn").append(locationLabel);
    $("#modalRightColumn").append(location);
            
    // EXPIRATION DATE
    var expires = $('<p>');
    var expiresLabel = "<br><i>Expiration Date: </i>"
    expires.text(x.mealexpires);
    $("#modalRightColumn").append(expiresLabel);
    $("#modalRightColumn").append(expires);

    // USER
    var user = $('<p>');
    var userLabel = "<br><i>Uploaded by </i>"
    user.text(x.username);
    $("#modalRightColumn").append(userLabel);
    $("#modalRightColumn").append(user);
}

function openModal(){
    alert("hey");    
}

function setStorage(array){
	mapData = JSON.stringify(array);
	localStorage.setItem("GetData" , mapData);
	return;
}
// TODO user button: pass in new value for the button with the username and send offff??


// TODO has to loop every noe and then. Set timer??

var currentLang;
var currentLong;
$(document).ready(function(){
    var dataPass;
      navigator.geolocation.getCurrentPosition(function(pos) {
        currentLang = pos.coords.latitude;
        currentLong = pos.coords.longitude;
    }, function(error) {
        currentLang = 54.767230;
        currentLong = 1.570390; // <--- school of engineering // center of durham --> 54.77525, -1.584852
    });   
    if (currentLang == undefined && currentLong == undefined){
        currentLang = 54.767230;
        currentLong = 1.570390;
    }

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
            if ($("#sortByOptions").val() == "proximityClosest") {
                var sortBy = "ascending";
                foodsToPost = sortFoodsToPost(foodsToPost, dataPass, sortBy);
            }
            if($("#sortByOptions").val() == "proximityFurthest"){
                var sortBy = "descending";

                foodsToPost = sortFoodsToPost(foodsToPost,dataPass,sortBy);
            }
            setStorage(foodsToPost);
            getPostedFoods(foodsToPost);
            var iframe = document.getElementById('mapIframe');
            iframe.src = iframe.src;
        }
    });
        
    $("#btnClearAll").click(function(){
        clearAll();
    })
   
    if (localStorage.foodPostToShow) {
        var post = JSON.parse(localStorage.foodPostToShow);
        seePost(post);
        $('#seePostsModal').modal('show');
        delete localStorage.foodPostToShow;
    }

})


function getPostedFoods(xx){
    $("#column0").html("");
     $("#column1").html("");
     $("#column2").html("");

    var checkArray = xx;

    var dataReturned;
    $.ajax({
        url: "/getPosts",
        type: "GET",
        dataType: "json",
        success: function(data){
            var toPrint = 0;
            dataReturned = JSON.parse(JSON.stringify(data));
            for (y in checkArray){
                for (var property = 0; property < dataReturned.length; property++){
                    x = dataReturned[property];
                    if (checkArray[y] == (x._id).toString()){
                        
                        if (x.collected != "true"){
                            toPrint++

                         // CREATE CARD
                        var divEl = $('<div>');
                        divEl.addClass("w3-card-4");

                        // CREATE IMAGE
                        var imgDiv = $('<div>');
                        imgDiv.addClass("text-center");
                        imgDiv.attr("id", "postImgDivNumber" + property);
                        var img2 = $('<img>');
                        img = (x.image).toString();
                        if (img == ""){
                            img2 = $('<span>');
                            img2.addClass("glyphicon glyphicon-picture");
                            img2.attr("style","margin-top:20px");
                        } else {
                            img2.data("parentDivId", "postImgDivNumber" + property);
                            img2.attr("src",(x.image).toString());
                            img2.addClass("center");
                            img2.attr("style", "height:160px; width:auto");
                            img2.on("error", function() {
                                var parentDiv = $("#" + $(this).data("parentDivId"))[0];
                                console.log("Error loading image for post " + $(this).data("parentDivId") + " - Switching to gylphicon");
                                var newimg2 = $('<span>');
                                newimg2.addClass("glyphicon glyphicon-picture");
                                newimg2.attr("style","margin-top:20px");
                                $(parentDiv).empty();
                                $(parentDiv).append(newimg2);
                            });
                        }
                        img2.appendTo(imgDiv);
                        imgDiv.appendTo(divEl);

                        // CREATE CONTAINER
                        var container = $('<div>');
                        container.addClass("w3-container w3-center");
                        container.appendTo(divEl);
                        container.appendTo(divEl);

                        // CREATE TITLE
                        var titleCon = $('<h4>')
                        titleCon.text((x.title).toString());
                        titleCon.appendTo(container);

                        // CREATE DESCRIPTION & AUTHOR
                        var bodyCon = $("<p>");
                        bodyCon.text(x.description);
                        var usernameToUse = x.username;
                        if (localStorage.username === x.username) {
                            usernameToUse += "(You)";
                        }
                        var authorCon = "<br><small class = 'text-muted'><i>" + usernameToUse + "</i><span class='userAvgRating" + x.username + "'></span></small><br>";
                        $.ajax({
                            type: "GET",
                            url: "/getUserRating",
                            data: {
                                username: x.username
                            },
                            success: function(data) {
                                $(".userAvgRating" + data.username).each(function(i, obj) {
                                    $(obj).text(" ★" + data.rating);
                                });
                            }
                        });
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
                    firstRound = true;
                    if (filters.onlyShowDescriptions == "true"){
                        if (foodPost.description != ""){
                            firstRound = true;
                        }
                        else{
                            firstRound = false;
                        }
                    }
                    console.log("HEEEERREEEEE " + foodPost.image);
                    if (filters.onlyShowImages == "true"){
                        if (foodPost.image != "" && foodPost.image != undefined){
                            if (firstRound != false){
                                firstRound = true;
                            }
                        }
                        else {
                            firstRound = false;
                        }
                    }
                    if (firstRound == true){
                        visibility = true;
                        foodsToPost.push(foodPost._id);
                    }
                }
                else {
                
                    // COMPARE DESCRIPTION AND KEYWORDS
                    var description = foodPost.description;
                    var description = description + foodPost.title;
                    description = description.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").toLowerCase();
                    var filterDesc = filters.description;
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
                }
                if (whatToPrint == "true") {                  
                    // check whether only show descriptions is true
                    var firstRound = true;
                    if (filters.onlyShowDescriptions == "true"){
                        if (foodPost.description != ""){
                            firstRound = true;
                            
                        }
                        else{
                            firstRound = false;
                        }
                    }
                    console.log("HEEEERREEEEE " + foodPost.image);
                    if (filters.onlyShowImages == "true"){
                        if (foodPost.image != "" && foodPost.image != undefined){
                            if (firstRound != false){
                                firstRound = true;
                            }
                        }
                        else {
                            firstRound = false;
                        }
                    }
                    if (firstRound == true){
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
            }         
        }
    return foodsToPost;
}

// Makes a list of checked filters
function loadFilters(){
    var checkHowMany = 0;
    var filters =  {
        usefilters: "true",
        mealtype: " ",
        mealtypecountry: " ",
        mealtypefood: " ",
        mealweight: " ",
        mealexpires: " ",
        mealTypeDietary: " ", 
        collectionbusiness: " ",
        distance: " ",
        description: "none",
        onlyShowImages: "false",
        onlyShowDescriptions: "false"
    };
    // MEAL TYPE
    var mealtypeList = [];
    $("#collapseMealType input:checked").each(function(){

        mealtypeList.push($(this).attr('name'))
    }) 
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
    // ONLY SHOW DESCRIPTIONS + IMAGES
    $("#collapseOnlyShow input:checked").each(function(){
            //mealtypedietarylist.push($(this).attr('value'))
        if ($(this).attr('value') == "description"){
            filters["onlyShowDescriptions"] = "true";
        }
        if ($(this).attr('value') == "pictures"){
            filters["onlyShowImages"] = "true";
        }
        
    })
    
    
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
    if (localStorage.username === x.username) {
        user.text(x.username + "(You)");
    } else {
        user.text(x.username);
    }
    var userStars = $("<span>");
    userStars.attr("id", "userAvgRating");
    $.ajax({
        type: "GET",
        url: "/getUserRating",
        data: {
            username: x.username
        },
        success: function(data) {
            // $("#userAvgRating").html("&#2973;");
            $("#userAvgRating").text(" ★" + data.rating);
        }
    });
    user.append(userStars);
    $("#modalRightColumn").append(userLabel);
    $("#modalRightColumn").append(user);
    // USER RATING (ADDED BY MIKE, SORRY IF IT MAKES THE MODAL LOOK BAD)
    if (localStorage.username !== x.username) {
        var userRating = $("<span>");
        var userRatingLabel = "<br><i id='rateThisUserNameLabel'>Rate " + x.username + "</i><br>";
        userRating.addClass("starRating");
        for (var i = 5; i > 0; i--) {
            var starInput = $("<input>");
            starInput.attr("id", "rating" + i);
            starInput.attr("type", "radio");
            starInput.attr("name", "userrating");
            starInput.attr("value", i);
            starInput.data("user", x.username);
            var starLabel = $("<label>");
            starLabel.attr("for", "rating" + i);
            starLabel.text(i);
            userRating.append(starInput);
            userRating.append(starLabel);
        }
        $.ajax({
            type: "GET",
            url: "/getMyRatingForUser",
            data: {
                me: localStorage.username,
                them: x.username
            },
            success: function(data) {
                if(data.rating) {
                    $("#rateThisUserNameLabel").text("Change your rating of " + data.user);
                    $("#rating" + data.rating).prop("checked", true);
                }
            }
        });
        $("#modalRightColumn").append(userRatingLabel);
        $("#modalRightColumn").append(userRating);
    }

    // CHAT BUTTON (ADDED BY SIMON, SORRY IF IT MESSES ANYTHING UP)
    $("#messageUser").attr("onclick","startChat('" + x.username + "')");

    $("input[name='userrating']").change(function(e) {
        var me = localStorage.username;
        var them = $(this).data("user");
        if (me === them) {
            alert("You can't rate yourself!");
        } else {
            var rating = $(this).val();
            $.ajax({
                type: "POST",
                url: "/rateUser",
                data: {
                    me: me,
                    them: them,
                    rating: rating
                },
                dataType: "json",
                success: function(data) {
                    alert("User rating updated");
                }
            });
        }
    });
}

function sortFoodsToPost(idList, dataReturned, sortBy){
    sortArray = [];

    for(var property=0; property < dataReturned.length; property++) {
                var x = dataReturned[property];
                for (y in idList){
                    if ((x._id).toString() == idList[y]){
                        var dist = calculateDistance(x.latitude, x.longitude);
                        user = [];
                        user.push(x._id);
                        user.push(dist);
                    }
                }
        sortArray.push(user);
    }
    if (sortBy == "ascending"){
        sortArray.sort(function(a,b){
            return a[1] - b[1];
        });
    }
    else if (sortBy == "descending"){
        sortArray.sort(function(a,b){
            return b[1] - a[1];
        });
     }
    newFoodsToPostList =[];
    for (var post = 0; post<sortArray.length;post++){
        newFoodsToPostList.push(sortArray[post][0]);
    }
    return newFoodsToPostList;
}


function openModal(id){
    //loop through and find the correct data
    $.ajax({
        url: "/getPosts",
        type: "GET",
        dataType: "json",
        success: function(data){
            dataReturned = JSON.parse(JSON.stringify(data));
                for (var property = 0; property < dataReturned.length; property++){
                    x = dataReturned[property];
                    if (x._id == (id)){
                        // send to cards
                        $("#seePostsModal").modal("toggle");
                        window.location = "findfood.html";
                        seePost(x);

                    }
                }
        }
    })
}


// MAP FUNCTION
function setStorage(array){
	mapData = JSON.stringify(array);
	localStorage.setItem("GetData" , mapData);
	return;
}


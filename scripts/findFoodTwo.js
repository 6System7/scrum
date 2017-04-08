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
        filterFoods(dataPass);
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
                        alert(toPrint);
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
    getPostedFoods(foodsToPost);
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
        collectionbusiness: " "
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
    
    
    
    //alert(Object.keys(filters).length);

    return filters;
} 

function updateSlider(slideValue){
    document.getElementById("distLabel").innerHTML = "Search radius(km): " + slideValue;
}

function sortColumn(colToSortId){
    if (colToSortId == "colDistance"){     
    }
}

// TODO eventually move notifications into global functions? 
// TODO has to loop every noe and then. Set timer??

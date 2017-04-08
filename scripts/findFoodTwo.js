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
     //   refreshTable();
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
            dataReturned = JSON.parse(JSON.stringify(data));
            for(var property=0; property < dataReturned.length; property++) {
                var x = dataReturned[property];
                for (y in checkArray){
                    if ((x._id).toString() == checkArray[y]){
                        
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
                        colNum = property;
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

// end of getPostedFoods  
//create array with all?? if in array then push.
    //go through and put id of each one to append. 
           // then iterate through array in here.

function refreshTable(data){
    // not playing
    var data = data;
    filters = [];
    filters = loadFilters();
    reloadTable(filters, data);
}

function filterFoods(dataPass){
    var data = dataPass;
    foodsToPost = []
    var filters = loadFilters();
    // for testing
    alert(Object.keys(filters).length);
    alert(filters.mealtype);
    ////// myobj[Object.keys(myobj)[0]];
    alert(data.length);
    for (var foodPostElem = 0; foodPostElem < data.length; foodPostElem++){
        var visibility = false;
        var foodPost = dataPass[foodPostElem];
       // alert(foodPost._id); prints alert
        
    
        for (var category = 0; category < Object.keys(filters).length; category++){
      //  alert(Object.keys(filters)[category]); // mealtype
        
        var postCheck = foodPost.mealtype;
        //alert(postCheck);
        var xox = filters[Object.keys(filters)[category]];
        //alert(xox[0]);  /// e.g breakfast
            for (var listInCategory = 0; listInCategory < xox.length; listInCategory++){
                if (xox[listInCategory] == postCheck){
                    visibility = true;
                }
            }
       
    }
        alert(visibility);
        if (visibility == true){
            foodsToPost.push(foodPost._id);
        }
        // PROBLEM 
        
        
        //for(var xx in xxx){
       //     alert(xx)
      //  }
    }
    getPostedFoods(foodsToPost);
}
    /*
    
    for (var foodPostElem = 0; foodPostElem < data.length; foodPostElem++){
        var visibility = false;
        var foodPost = dataPass[foodPostElem];
        
        // now iterate through the filter keys
        for (var filterElem in filters){
            var postCheck = foodPost.filterElem;
            
            for (var xx in filterElem){
                if (postCheck == xx){
                    
                   
                    visibility = true;
                }
            }
        }
        */
        
        // go through and check against every food pst.
        //alert(dataPass[property]._id);
       // for (var property in filters) {
        //    if (object.hasOwnProperty(property)) {
        // do stuff
          //  }
       // }
       // for (var fieldNum = 0; fieldNum < filters.length; //fieldNum++){
            
            //filters[fieldNum] == 
            //alert(filters.mealType.length);
            
       // }
       /* CURRENTLY PLAYING WITH
       for (var fieldNum = 0; fieldNum < foodPost.length; fieldNum++){
            field = foodPost[fieldNum];
            for (var fieldOptionNum = 0; fieldOptionNum < field.length; fieldOptionNum++){
                alert(field[fieldOptionNum]);
                if (foodPost.field == field[fieldOptionNum]){
                    alert("HERE");
                    visibility = true;
                    alert("this");
                    
                }
            }
        }*/
       // if (visibility == true){
       //     foodsToPost.push(foodPost._id.toString());
       //     alert("here");
       // }
   // }
 //   /


/*
var key = "happyCount";
var obj = {};
obj[key] = someValueArray;
myArray.push(obj);

*/


// Grabs the possible filters
function loadFilters(){
    var filters = {
        mealtype: " "
    };
    var mealtypeList = [];
    $("#collapseMealType input:checked").each(function(){
      
        mealtypeList.push($(this).attr('name'))
        
    })
    // put in mealtype if its not empty?? TODO
    //filters(mealType);
    alert(mealtypeList.length);
    filters["mealtype"] = mealtypeList;
    alert(filters.mealtype);
    return filters;
} 
//var dict = {
  //key1: "value1",
///  key2: "value2"
function updateSlider(slideValue){
    document.getElementById("distLabel").innerHTML = "Search radius(km): " + slideValue;
}

function sortColumn(colToSortId){
    if (colToSortId == "colDistance"){     
    }
}

/*function reloadTable(filters, data){
    $("#column0").html("");
     $("#column1").html("");
     $("#column2").html("");
    
    var dataReturned = data;
    var numOfYes =-1;
    for(var property=0; property < dataReturned.length; property++) {
                
                var size = 0;
                var x = dataReturned[property];
                var title = "";
                var description = "";
                var img = "";
                var distance = "";
                var lat = 0;
                var long = 0;
                var username = " ";
                var totalShow = true;
                for (var l in x){
                    size++;
                    if (!("mealtype" in x)){
                        totalShow = false;
                    }
                    if (l == "mealtype"){
                        var show = 0;
                        for (var choice in filters.mealType){
                            if (x[l] == filters.mealType[choice]){
                                show++;
                            }
                        }
                        if (show == 0){
                            totalShow  = false;;
                        }
                        
                    }
                    if(l == "title"){
                        title = x[l].toString();
                    } 
                    else if (l == "description"){
                        description = x[l].toString();
                       // var y = size.toString();
                       // var p2 = p2 + ("<td>" + x[l] + "</td>");
                    };
                    if (l == "image"){
                        img = x[l].toString();
                        /*img = '<img src="' + img + '">';
                        
                        if (img == '<img src="">'){
                   
                            img = '<div class = "text-center"><br><span class="glyphicon glyphicon-picture" >  </span></div>'
                        })*/
                 /*   };
                    if(l == "latitude"){
                        lat = x[l];
                    }
                    if(l == "longitude"){
                        long = x[l];
                    }
                    if (l == "username"){
                        username = x[l];
                    }
                };
                memberLang = 0;
                memberLong = 0;
                if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function(pos) {
                            memberLang = pos.coords.latitue;
                            memberLong = pos.coords.longitude;
                        });
                    } else {
                        memberLang = 54.775250;
                        memberLong = -1.584852;
                        alert("ERROR : Using default location");
                }
                dist = getDistanceFromLatLonInKm(memberLang, memberLong, lat, long).toFixed(1);
                if (totalShow == true){
                   
                    numOfYes++;
                    /*p2 = '<div class="w3-card-4">' + img + '<div class="w3-container w3-center"><h4>' + title + '</h4><p>' + description + '<br><small class = "text-muted"><i>' + username + '</i></small></p></div></div><br>';*/
                    
                /*    var p2 = $('<div class = "w3-card-4">');
                    p2.attr("src",img);
                    colNum = numOfYes;
                    alert(colNum);
                    colNum = colNum % 3;
                    var str = "column" + colNum.toString();
                   //document.getElementById(str).insertAdjacentHTML('beforeEnd', p2);
                    var elem = $("#column3");
                    elem.append("<p>HR</p>");
                }
            } 
        
     
}*/
    


// TODO eventually move notifications into global functions? 
// TODO has to loop every noe and then. Set timer??


/*
  <li class="notification">
      <div class="media">
        <div class="media-left">
          <div class="media-object">
            <img data-src="holder.js/50x50?bg=cccccc" class="img-circle" alt="Name">
          </div>
        </div>
        <div class="media-body">
          <strong class="notification-title"><a href="#">Dave Lister</a> commented on <a href="#">DWARF-13 - Maintenance</a></strong>
          <p class="notification-desc">I totally don't wanna do it. Rimmer can do it.</p>
          <div class="notification-meta">
            <small class="timestamp">27. 11. 2015, 15:00</small>
          </div>
        </div>
      </div>
  </li>
*/
            
            /*-- WILL NEED BELOW LATER SO DON'T DELETE */
// ITERATING THROUGH
          //  $.each(dataReturned[0],function(key,value){
          //     theHTML += "<tr><td>" + key + "</td><td>" + value + "</td></tr>";
          //  })
          //  for (var key in data)
          //  for (var key in data){
               // if (data.hasOwnProperty(key){
                //  var header1 = "<th> " + key + "</th>";
                   // document.getElementById("table-header-food").insertAdjacentHTML('beforebegin', header1);
            //});
        //};
     //end of function (data)
$(document).ready(function(){
    var dataPass;
    getNotifications();
    $.ajax({
        url: "/getPosts",
        type: "GET",
        dataType: "json",
        success: function(data){

            var dataReturned = JSON.parse(JSON.stringify(data));
            dataPass = dataReturned;

            for(var property=0; property < dataReturned.length; property++) {

                var size = 0;
                var x = dataReturned[property];
                //var p1 = "<div class='w3-card-4'>"
                //var p2 = "";
                var title = "";
                var description = "";
                var img = "";
                var distance = "";
                var lat = 0;
                var long = 0;
                var username = " ";
                for (var l in x){
                    size++;
                    if(l == "title"){
                        title = x[l].toString();
                    }
                    else if (l == "description"){
                        description = x[l].toString();
                       // var y = size.toString();
                       // var p2 = p2 + ("<td>" + x[l] + "</td>");
                    };
                    if (l == "image"){
                        if (!x[l]) {
                            img = "NOIMAGE.png"
                        } else {
                            img = x[l].toString();
                        }
                        img = '<img src="' + img + '">';

                        if (img == '<img src="">'){

                            img = '<div class = "text-center"><br><span class="glyphicon glyphicon-picture" >  </span></div>'
                        }
                    };
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

                p2 = '<div class="w3-card-4">' + img + '<div class="w3-container w3-center"><h4>' + title + '</h4><p>' + description + '<br><small class = "text-muted"><i>' + username + '</i></small></p></div></div><br>';

                colNum = property;
                colNum = colNum % 3;
                var str = "column" + colNum.toString();

               document.getElementById(str).insertAdjacentHTML('beforeEnd', p2);
            };
        }
    })
    $("#btnUpdate").click(function(){
        // TODO
        refreshTable(dataPass);
    })


});

function refreshTable(data){
    var data = data;
    filters = [];
    filters = loadFilters();
    reloadTable(filters, data);
}


function loadFilters(){
    var filters = new Object();
    //var chkMealType = $("#collapseMealType")[0];
   // alert(chkMealType.value.toString());
    filters.mealType = []
    $("#collapseMealType input:checked").each(function(){
        filters.mealType.push($(this).attr('name'));

    })
    return filters;
}

function reloadTable(filters, data){
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
                        if (!x[l]) {
                            img = "NOIMAGE.png"
                        } else {
                            img = x[l].toString();
                        }
                        img = '<img src="' + img + '">';

                        if (img == '<img src="">'){

                            img = '<div class = "text-center"><br><span class="glyphicon glyphicon-picture" >  </span></div>'
                        }
                    };
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
                    p2 = '<div class="w3-card-4">' + img + '<div class="w3-container w3-center"><h4>' + title + '</h4><p>' + description + '<br><small class = "text-muted"><i>' + username + '</i></small></p></div></div><br>';

                    colNum = numOfYes;
                    alert(colNum);
                    colNum = colNum % 3;
                    var str = "column" + colNum.toString();

                   document.getElementById(str).insertAdjacentHTML('beforeEnd', p2);
                }
            }


}



// TODO eventually move notifications into global functions?
// TODO has to loop every noe and then. Set timer??

function updateSlider(slideValue){
    document.getElementById("distLabel").innerHTML = "Search radius(km): " + slideValue;
}

function sortColumn(colToSortId){
    if (colToSortId == "colDistance"){


    }
}

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

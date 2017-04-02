$(document).ready(function(){
    getNotifications();
    $.ajax({
        url: "/getPosts",
        type: "GET",
        dataType: "json",
        success: function(data){
            var dataReturned = JSON.parse(JSON.stringify(data));
            
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
                for (var l in x){
                    size++;
                    if(size == 2){
                        title = x[l].toString();
                    } 
                    else if (size == 3){
                        description = x[l].toString();
                       // var y = size.toString();
                       // var p2 = p2 + ("<td>" + x[l] + "</td>");
                    };
                    if (size == 4){
                        img = x[l].toString();
                        img = '<img src="' + img + '">';
                        
                        if (img == '<img src="">'){
                   
                            img = '<div class = "text-center"><br><span class="glyphicon glyphicon-picture" >  </span></div>'
                        }
                    };
                    if(size == 5){
                        lat = x[l];
                    }
                    if(size == 6){
                        long = x[l];
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
                
                p2 = '<div class="w3-card-4">' + img + '<div class="w3-container w3-center"><h4>' + title + '</h4><p>' + description + '</p></div></div><br>'; 
                
                colNum = property;
                colNum = colNum % 3;
                //colNum = ((property) % 4);
                //alert(property);
               // alert("here" + colNum.toString());
                
                var str = "column" + colNum.toString();
              
               document.getElementById(str).insertAdjacentHTML('beforeEnd', p2);   
            }; 
        }
    })
    $("#btnUpdate").click(function(){
        // TODO
        refreshTable(dataset);
    })
 
    
});

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
              


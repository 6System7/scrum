$(document).ready(function(){
    getNotifications();
    $.ajax({
        url: "/getPosts",
        type: "GET",
        dataType: "json",
        success: function(data){
            var dataReturned = JSON.parse(JSON.stringify(data));
            for(var property in dataReturned) {
                var size = 0;
                var x = dataReturned[property];
                var p1 = "<tr>"
                var p2 = p1;
                for (var l in x){
                    size++;
                    if(size == 2 || size == 3){
                        var y = size.toString();
                        var p2 = p2 + ("<td>" + x[l] + "</td>");
                    };
                    if (size == 4){
                        var y = size.toString();
                        var p2 = p2 + ("<td> <img src='" + x[l] + "' ></td>");
                    };
                    
                };
                p2 = p2 + " </tr>";
                document.getElementById("tBodyFood").insertAdjacentHTML('beforeEnd', p2);      
            }; 
        }
    })
    $("#btnUpdate").click(function(){
        // TODO
    })
 
    
});

// TODO eventually move notifications into global functions? 
// TODO has to loop every noe and then. Set timer??
function getNotifications() {
    userID = "Bob Smith";
    typeOfMessage = " has sent you a <strong> message </strong>" //TODO will contain link to message
    typeOfMessageImage = " glyphicon glyphicon-envelope"
    newNotif = "<li class='notification'><div class='panel panel-default'> <div class = 'panel-body'><span class='glyphicon glyphicon-envelope' align = 'inline'> </span>" + userID + typeOfMessage + "</div></div></li>";
    document.getElementById("notificationList").insertAdjacentHTML('beforeEnd', newNotif);
    checkNearbyFoods()
}

// eventually pass in distance as parameter?
function checkNearbyFoods(){
    memberLang = 0;
    memberLong = 0;
    if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
                memberLang = pos.coords.latitue;
                memberLong = pos.coords.longitude;
            });
        } else {
            initMap(54.775250, -1.584852);
        }
        $.ajax({
        url: "/getPosts",
        type: "GET",
        dataType: "json",
        success: function(data){
            var dataReturned = JSON.parse(JSON.stringify(data));
            for(var property in dataReturned) {
                var size = 0;
                var x = dataReturned[property];
                var p2 = "";
                long = 0;
                lat = 0;
                for (var l in x){
                    size++;
                    if (size == 2){
                        p2 = x[l];
                    }
                    if(size == 5){
                        lat = x[l];
                    }
                    if(size == 6){
                        long = x[l];
                    }
                };
                dist = getDistanceFromLatLonInKm(memberLang, memberLong, lat, long).toFixed(1);
                if (dist < 6000){
                     p2 = "<li class='notification'><div class='panel panel-default'><div class = 'panel-header'> New food post in your local area!'</div><div class = 'panel-body'>  p2 + ' is this far away : " + dist.toString() + "</div></div></li>";
                    document.getElementById("notificationList").insertAdjacentHTML('beforeEnd', p2 );                     
                } 
            }; 
        }
    })
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

function updateSlider(slideValue){
    document.getElementById("distLabel").innerHTML = "Search radius(km): " + slideValue;
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
              

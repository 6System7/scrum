$(document).ready(function(){
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
                };
                p2 = p2 + " </tr>";
                document.getElementById("tBodyFood").insertAdjacentHTML('beforeEnd', p2);      
            }; 
        }
    })
    
    // Notifications
    getNotifications();
    
})

function getNotifications(){
    userID = "Bob Smith";
    typeOfMessage = " has sent you a <strong> message </strong>" //TODO will contain link to message
    typeOfMessageImage = " glyphicon glyphicon-envelope"
    newNotif = "<li class='notification'><span class='glyphicon glyphicon-envelope' align = 'inline'> </span>" + userID + typeOfMessage + "</li>";
 document.getElementById("notificationList").insertAdjacentHTML('beforeEnd', newNotif);
    
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
              

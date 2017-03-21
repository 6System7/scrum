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
    } //end of function (data)
    });
})
                  

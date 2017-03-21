/*$(document).ready(function(){
    alert("HERE");
    $.ajax({
        url: "/getPost",
        type: "GET",
        
    })
})
$.ajax(
                {url: "/madeleine.sands/faq2016/topics.php", 
                 type: "GET",
                 success: function(result){
                     var obj = JSON.parse(result);
                     for(var property in obj) {
                         var size = 0;
                         var x = obj[property];
                         for (var l in x){
                            size++;
                            var y = size.toString();
                            var p2 = "<li class='list-group-item' onclick= 'test(" + y +"); toggler();' > Topic " + y + " : " + x[l] + "</li>";
                            document.getElementById("topicarea").insertAdjacentHTML('beforebegin', p2);
                            };
                        };   
                }});
            });*/

$(document).ready(function(){
    alert("HERE");
    alert("here");
    $.ajax({
        type: "GET",
        url: "/getPost",
        data: indexedArray,
        dataType: "json"
        success: function(data){
      //      var obj = JSON.parse(data){
    //    var size = 0;
    ////    var x = obj[property];
    //    for (var l in x){
    //    var part1 = "<"
    //}
        
   // }
             for (var key in data){
        if (data.hasOwnProperty(key){
        var header1 = "<th> " + key + "</th>";
        document.getElementById("table-header-food").insertAdjacentHTML('beforebegin', header1);
    });
    };
    }
})
        /*var trHTML = "";
        $.each(data, function(key, value){
            trHTML +='<tr><td>' + value.id + */
    
    });

    

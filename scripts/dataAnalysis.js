function getStatsByUser(username){
    $.getJSON("/getposts", function(postList){

        var filteredPostList = [];
        for(var i = 0; i < postList.length; i++){
            if(postList[i].username === username){
                filteredPostList.push(postList[i].title);
            }
        }

        var statList = filteredPostList;

        for(var i = 0; i < statList.length; i++){
            $('#statList').append(
                $('<li>').append(statList[i])
            );
        }

    });

}

function getStatsFull(){

}
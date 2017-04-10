$(document).ready(function() {
    if (localStorage.username) {
        $.ajax({
            url: "/getPosts",
            type: "GET",
            data: {
                username: localStorage.username
            },
            dataType: "json",
            success: function(data) {
                var foodsToShow = []
                var dataReturned = JSON.parse(JSON.stringify(data));
                generatePostCards(dataReturned);
            }
        });
    }
});

function generatePostCards(data) {
    $("#column0").empty();
    $("#column1").empty();
    $("#column2").empty();
    $("#column3").empty();

    var toPrint = 0;
    for (var property = 0; property < data.length; property++) {
        var x = data[property];
        toPrint++;

        // CREATE CARD
        var divEl = $('<div>');
        divEl.addClass("w3-card-4");

        // CREATE IMAGE
        var imgDiv = $('<div>');
        imgDiv.addClass("text-center");
        var img2 = $('<img>');
        img = (x.image).toString();
        if (img == "") {
            img2 = $('<span>');
            img2.addClass("glyphicon glyphicon-picture");
            img2.attr("style", "margin-top:20px");
        } else {
            img2.attr("src", (x.image).toString());
            img2.addClass("center");
            img2.attr("style", "height:160px; width:auto")
        }
        img2.appendTo(imgDiv);
        imgDiv.appendTo(divEl);

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

        // ADD EDIT BUTTON
        var btnEdit = $("<button>");
        $(btnEdit).text("Edit");
        $(btnEdit).attr("type", "button");
        $(btnEdit).addClass("btn btn-primary");
        $(btnEdit).data("post", x);
        $(btnEdit).click(function() {
            localStorage.postToEdit = JSON.stringify($(this).data("post"));
            window.location.replace("/postfood.html");
        });
        $(divEl).append(btnEdit);

        // TODO ADD DELETE BUTTON

        // CALCULATE COLUMN
        colNum = toPrint - 1;
        colNum = colNum % 4;
        var str = "#column" + colNum.toString();

        $(str).append(divEl);
        (divEl).after("<br>");
    }
}

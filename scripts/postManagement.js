// Load in user's own posts
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

                // Put collected last
                var uncollected = [];
                var collected = [];
                for (var i = 0; i < dataReturned.length; i++) {
                    if (dataReturned[i].collected) {
                        collected.push(dataReturned[i]);
                    } else {
                        uncollected.push(dataReturned[i]);
                    }
                }
                uncollected.push.apply(uncollected, collected);

                generatePostCards(uncollected);
            }
        });
    }
});

// Take list of posts, generate cards for each post and place on page
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
        imgDiv.attr("id", "postImgDivNumber" + property);
        var img2 = $('<img>');
        img = (x.image).toString();
        if (img == "") {
            img2 = $('<span>');
            img2.addClass("glyphicon glyphicon-picture");
            img2.attr("style", "margin-top:20px");
        } else {
            img2.data("parentDivId", "postImgDivNumber" + property);
            img2.attr("src", (x.image).toString());
            img2.addClass("center");
            img2.attr("style", "height:160px; width:auto");
            img2.on("error", function() {
                var parentDiv = $("#" + $(this).data("parentDivId"))[0];
                // console.log("Error loading image for post " + $(this).data("parentDivId") + " - Switching to gylphicon");
                var newimg2 = $('<span>');
                newimg2.addClass("glyphicon glyphicon-picture");
                newimg2.attr("style","margin-top:20px");
                $(parentDiv).empty();
                $(parentDiv).append(newimg2);
            });
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
        var authorCon = "<br><small class = 'text-muted'><i>" + x.username + " (You)</i></small>";
        bodyCon.append(authorCon);
        bodyCon.appendTo(container);

        // ADD EDIT BUTTON
        var btnEdit = $("<button>");
        $(btnEdit).text("Edit");
        $(btnEdit).attr("type", "button");
        $(btnEdit).addClass("btn btn-primary");
        $(btnEdit).data("post", x);
        $(btnEdit).attr("style", "margin-left:5px; margin-bottom:5px");
        $(btnEdit).css("background-color", "#1C939B");
        $(btnEdit).css("border-color", "white");
        //$(btnEdit).css("padding","5px");
        $(btnEdit).click(function() {
            localStorage.postToEdit = JSON.stringify($(this).data("post"));
            window.location.replace("/postfood.html");
        });
        $(divEl).append(btnEdit);

        // ADD DELETE BUTTON
        var btnDelete = $("<button>");
        $(btnDelete).text("Delete");
        $(btnDelete).attr("type", "button");
        $(btnDelete).addClass("btn btn-danger");
        $(btnDelete).css("float", "right");
        $(btnDelete).css("margin-right", "5px");
        // $(btnDelete).css("background-color", "#1C939B");
        $(btnDelete).css("border-color", "white");
        // $(btnDelete).css("padding","5px");
        // $(btnDelete).attr("style","display: inline-block");
        $(btnDelete).data("post", x);
        $(btnDelete).click(function() {
            if (confirm("Are you sure you want to delete this post?")) {
                $.ajax({
                    type: "POST",
                    url: "/deletePost",
                    data: {
                        id: $(this).data("post")._id
                    },
                    dataType: "json",
                    success: function(data) {
                        $.getJSON("/getArchiveData", function(jsonData) {
                            $.ajax({
                                type: "POST",
                                url: "/updateArchiveData",
                                data: {
                                    field: "deletedPostsAmount",
                                    newValue: Number(jsonData[0].deletedPostsAmount) + 1
                                },
                                complete: function(data) {
                                    location.reload();
                                }
                            });
                        });
                    },
                    error: function() {
                        alert("Delete request failed, please try again later");
                    }
                });

            }
        });
        $(divEl).append(btnDelete);

        // ADD COLLECTED BUTTON
        var btnCollected = $("<button>");
        if (x.collected) {
            // $(btnCollected).addClass("disabled");
            $(btnCollected).text("Mark not collected");
            $(btnCollected).addClass("btn btn-warning");
        } else {
            $(btnCollected).text("Mark collected");
            $(btnCollected).addClass("btn btn-success");
        }
        // $(btnCollected).css("background-color", "#1C939B");
        $(btnCollected).attr("type", "button");
        $(btnCollected).css("float", "right");
        $(btnCollected).css("margin-right", "5px");
        $(btnCollected).css("border-color", "white");
        $(btnCollected).data("post", x);
        $(btnCollected).click(function() {
            var post = $(this).data("post");
            var difference;
            if (post.collected) {
                delete post.collected;
                difference = -1;
            } else {
                post.collected = true;
                difference = 1;
            }

            $.ajax({
                type: "POST",
                url: "/addPost",
                data: {
                    postToPost: post
                },
                dataType: "json",
                success: function(data) {
                    // console.log("Success when posting");
                },
                error: function() {
                    // NOTE commented out because refreshing the page below causes this to 'fail' when it doesn't
                },
                complete: function() {
                    $.getJSON("/getArchiveData", function(jsonData) {
                        $.ajax({
                            type: "POST",
                            url: "/updateArchiveData",
                            data: {
                                field: "collectedPostsAmount",
                                newValue: Number(jsonData[0].collectedPostsAmount) + difference
                            },
                            complete: function(data) {
                                location.reload();
                            }
                        });
                    });
                }
            });
        });
        $(divEl).append(btnCollected);

        // CALCULATE COLUMN
        colNum = toPrint - 1;
        colNum = colNum % 4;
        var str = "#column" + colNum.toString();

        $(str).append(divEl);
        (divEl).after("<br>");
    }
}

//Get required packages
var express = require("express");
var sha1 = require('sha1');
var MongoClient = require("mongodb").MongoClient;
var fs = require("fs");
var app = express();
var path = __dirname + "/";
var savedRes;
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

var db_URI = "mongodb://john:6system7@ds119220.mlab.com:19220/heroku_q2dllfgh";
var db;

// Use connect method to connect to the Server
MongoClient.connect(db_URI, function(err, database_object) {
    if (err) {
        console.log("Failed to connect to database\n", err);
    } else {
        console.log("Connected correctly to server");
        db = database_object;
    }
});

//Send initial files to use such as bootstrap
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(express.static('scripts'));
app.use(express.static('post-images'));

//Direct requests to various urls
app.get("/", function(req, res) {
    res.sendFile(path + "home.html");
});

app.post("/addPost", function(req, res) {
    var post = req.body.postToPost;

    if (post.image) {
        var regex = /^data:.+\/(.+);base64,(.*)$/;
        var matches = post.image.match(regex);
        var ext = "." + matches[1];
        var data = matches[2];
        var buffer = new Buffer(data, 'base64');

        var fileName = "img" + Date.now();
        var additional = "";
        var counter = 1;
        while (fs.existsSync("post-images/" + fileName + additional + ext)) {
            additional = "(" + counter + ")";
            counter ++;
        }
        fileName += additional + ext;

        post.image = fileName;

        fs.writeFile("post-images/" + fileName, buffer, "binary", function(err) {
            if (err) {
                throw err;
            } else {
                console.log("File saved as post-images/" + fileName);
            }
        });
    } else {
        console.log("No image attached");
    }

    db.collection("posts").save(post, function(err, results) {
        if (err) {
            console.log("Saving post failed: " + err.toString());
        } else {
            console.log("Saving post success");
        }
    });
});

app.get("/getPosts", function(req, res) {
    db.collection("posts").find().toArray(function(err, results) {
        res.setHeader("Content-Type", "application/json");
        if (err) {
            res.send(JSON.stringify({
                "error": err
            }));
        } else {
            res.send(JSON.stringify(results));
        }
    });
});

app.post("/addUser", function(req, res) {
    var user = {};
    user.username = req.body.username;
    user.passwordsha1 = sha1(req.body.password);
    user.rating = req.body.rating;
    user.realname = req.body.realname;
    user.email = req.body.email;

    db.collection("users").save(user, function(err, results) {
        if (err) {
            console.log("Saving user failed: " + err.toString());
        } else {
            console.log("Saving user success");
        }
    });
});

app.get("/getUsers", function(req, res) {
    db.collection("users").find().toArray(function(err, results) {
        res.setHeader("Content-Type", "application/json");
        if (err) {
            res.send(JSON.stringify({
                "error": err
            }));
        } else {
            res.send(JSON.stringify(results));
        }
    });
});

app.get("/home.html", function(req, res) {
    res.sendFile(path + "home.html");
});

app.get("/findfood.html", function(req, res) {
    res.sendFile(path + "findfood.html");
});

app.get("/postfood.html", function(req, res) {
    res.sendFile(path + "postfood.html");
});

app.get("/loginAndRegister.html", function(req, res) {
    res.sendFile(path + "loginAndRegister.html");
});

app.get("/account.html", function(req, res) {
    res.sendFile(path + "account.html");
});

app.get("*", function(req, res) {
    res.sendFile(path + "404.html");
});

//Start server and listen on port 8080
app.listen(process.env.PORT || 8080, function() {
    console.log("Live at Port 8080");
});

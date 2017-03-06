//Get required packages
var express = require("express");
var app = express();
var MongoClient = require('mongodb').MongoClient
var path = __dirname + "/";
var savedRes;

var db_URI = "mongodb://john:6system7@ds119220.mlab.com:19220/heroku_q2dllfgh";
var db;

// Use connect method to connect to the Server
MongoClient.connect(db_URI, function(err, database_object) {
    if (err) {
        console.log("Failed to connect to database", err);
    } else {
        console.log("Connected correctly to server");
        db = database_object;
    }
});

//Direct requests to various urls
app.get("/", function(req, res) {
    res.sendFile(path + "home.html");
});

app.get("/getPosts", function(req, res) {
    db.collection("posts").find().toArray(function(err, results) {
        res.setHeader("Content-Type", "application/json");
        if(err) {
            res.send(JSON.stringify({"error": err}));
        } else {
            res.send(JSON.stringify(results));
        }
    });
});

app.get("/getUsers", function(req, res) {
    db.collection("users").find().toArray(function(err, results) {
        res.setHeader("Content-Type", "application/json");
        if(err) {
            res.send(JSON.stringify({"error": err}));
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

app.get("/account.html", function(req, res) {
    res.sendFile(path + "account.html");
});


//Send initial files to use such as bootstrap
// app.use("/", router);
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

//Start server and listen on port 8080
app.listen(process.env.PORT || 8080, function() {
    console.log("Live at Port 8080");
});

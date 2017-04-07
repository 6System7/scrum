//Get required packages
var express = require("express");
var sha1 = require('sha1');
var ip = require('ip');
var nodemailer = require('nodemailer');
var uuidV4 = require('uuid/v4');
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
app.use('/less', express.static(__dirname + '/node_modules/bootstrap/dist/less'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use(express.static('pages'));
app.use(express.static('scripts'));
app.use(express.static('post-images'));
app.use(express.static('brand-images'));
app.use(express.static('custom-css'));

//Set up email system
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "6system7@gmail.com",
        pass: "6System7LovesOats"
    }
});

//Direct requests to various urls
app.get("/", function(req, res) {
    res.sendFile(path + "pages/home.html");
});

// POSTS
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
            counter++;
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

app.get("/removeUnusedImages", function(req, res) {
    console.log("Removing any unsused images...");
    var folder = "./post-images/";
    fs.readdir(folder, function(err, files) {
        files.forEach(function(file) {
            if (file !== "NOIMAGE.png") {
                db.collection("posts").findOne({image:file}, function(err, document) {
                    if (!document && !err) {
                        // IMAGE NOT REFERENCED BY ANY POST
                        fs.unlink(folder + file, function(err) {
                            if (err) {
                                console.log("Could not delete " + file);
                            } else {
                                console.log("Deleted " + file);
                            }
                        })
                    }
                });
            }
        });
    });
    res.send("Deletion has begun.");
});

// USERS
app.post("/addUser", function(req, res) {
    var user = {};
    user.username = req.body.username;
    user.passwordsha1 = sha1(req.body.password);
    user.authkey = req.body.authKey;
    user.rating = Number(req.body.rating);
    user.realname = req.body.realName;
    user.email = req.body.email;

    db.collection("users").save(user, function(err, results) {
        if (err) {
            res.send(err.toString());
            console.log("Saving user failed: " + err.toString());
        } else {
            res.send(results);
            console.log("Saved user successfully");
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

app.post("/editUser", function(req, res) {
    var username = req.body.username;
    var updateField = req.body.field;
    var newValue = req.body.newValue;
    var updateData = {};
    updateData[updateField] = newValue;
    if (username !== undefined && updateField !== undefined && newValue !== undefined) {
        db.collection("users").update({
            "username": username
        }, {
            $set: updateData
        }, function(err, results) {
            if (err) {
                res.send(err.toString());
                console.log("Updating user failed: " + err.toString());
            } else {
                res.send(results);
                console.log("Updating user success");
            }
        });
    }
});

// FUNCTIONS
app.get("/sha1", function(req, res) {
    var inputString = req.query.string;
    if (inputString !== undefined) {
        res.send(sha1(inputString));
    }
});

app.get("/getIP", function(req, res) {
    res.send(ip.address());
});

app.get("/getUUID", function(req, res) {
    res.send(uuidV4());
});

// RESET TOKENS
app.post("/addResetToken", function(req, res) {
    var tokenData = {};
    tokenData.resetToken = req.body.resetToken;
    tokenData.username = req.body.username;
    tokenData.expirationDate = req.body.expirationDate;

    db.collection("resetTokens").find().toArray(function(err, results) {

        var tokenExists = false;
        for (var i = 0; i < results.length; i++) {
            var jsonResult = results[i];
            if (jsonResult.username === tokenData.username) {
                tokenExists = true;
            }
        }

        if (tokenExists) {
            db.collection("resetTokens").remove({username: tokenData.username}, function (err, results) {
                if (err) {
                    console.log("Deleting token failed: " + err.toString());
                } else {
                    console.log("Deleted pre-existing token successfully");
                }
            });
        }

        db.collection("resetTokens").save(tokenData, function (err, results) {
            if (err) {
                res.send(err.toString());
                console.log("Saving reset token failed: " + err.toString());
            } else {
                res.send(results);
                console.log("Saved reset token successfully");
            }
        });
    });

});

app.get("/getResetTokens", function(req, res) {
    db.collection("resetTokens").find().toArray(function(err, results) {
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

app.post("/deleteResetToken", function(req, res){
    var resetToken = req.body.resetToken;

    db.collection("resetTokens").remove({resetToken: resetToken}, function(err, results){
        if (err) {
            res.send(err.toString());
            console.log("Deleting token failed: " + err.toString());
        } else {
            res.send(results);
            console.log("Deleted token successfully");
        }
    });
});

app.post("/cleanResetTokens", function(req, res){
    db.collection("resetTokens").find().toArray(function(err, results) {

        var currentDate = new Date(Date.now());
        var deleteCount = 0;

        for (var i = 0; i < results.length; i++) {
            var jsonResult = results[i];
            if (jsonResult.expirationDate < currentDate) {
                deleteCount++;
                db.collection("resetTokens").remove({resetToken: jsonResult.resetToken}, function(err, results){
                    if (err) {
                        console.log("Deleting token failed: " + err.toString());
                    } else {
                        console.log("Deleted token " + jsonResult.resetToken + " successfully");
                    }
                });
            }
        }

        res.send("Deleted " + deleteCount + " expired Reset Token entries");
        console.log("Finished cleaning with " + deleteCount + " deletions");

    });
});

// EMAIL
app.post("/sendEmail", function(req, res) {
    console.log("Request to send email made...");
    var toAddress = req.body.toAddress;
    var subject = req.body.subject;
    var message = req.body.message;

    var mailOptions = {
        from: '"Scrum App" <noreply@scrum.com>',
        to: toAddress,
        subject: subject,
        text: message
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log("Error when sending mail: " + err.toString());
            res.send(err.toString());
        } else {
            console.log("Email sent: " + info.response);
            res.send(info)
        }

    });

});

app.get("*", function(req, res) {
    res.redirect('/404.html');
});

//Start server and listen on port 8080
app.listen(process.env.PORT || 8080, function() {
    console.log("Live at Port " + (process.env.PORT || "8080"));
});

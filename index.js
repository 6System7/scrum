//Get required packages
var express = require("express");
var sha1 = require('sha1');
var ip = require('ip');
var nodemailer = require('nodemailer');
var uuidV4 = require('uuid/v4');
var MongoClient = require("mongodb").MongoClient;
var ObjectID = require("mongodb").ObjectID;
var fs = require("fs");
var enforce = require('express-sslify');
var app = express();
var path = __dirname + "/";
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

//Chat stuff
var server = require('http').Server(app);
var io = require('socket.io')(server);


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

// If on heroku
if(process.env.PORT) {
    // FORCE HTTPS
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

//Send initial files to use such as bootstrap
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/less', express.static(__dirname + '/node_modules/bootstrap/dist/less'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/fonts', express.static(__dirname + '/node_modules/bootstrap/fonts'));
app.use('/leaflet', express.static(__dirname + '/node_modules/leaflet/dist'));
app.use('/quagga', express.static(__dirname + '/node_modules/quagga/dist'));
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
// Path for saving a new or edited post
app.post("/addPost", function(req, res) {
    var post = req.body.postToPost;

    // Ensure any _id is in mongodb format (when editing a post, this ensures it REPLACES the original)
    if (post._id && typeof post._id === 'string') {
        post._id = ObjectID.createFromHexString(post._id);
    }

    if (!post.datePosted) {
        post.datePosted = new Date();
    }

    // Save attached images to disk if not already saved
    if (post.image && post.saveImage) {
        // TODO Mike - Use AWS so images persist through re-deploys without cluttering the repo -
        // https://devcenter.heroku.com/articles/s3-upload-node
        // https://www.npmjs.com/package/s3-uploader
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
        console.log("No image attached, or image already saved (from post editing)");
    }
    delete post.saveImage;

    db.collection("posts").save(post, function(err, results) {
        if (err) {
            console.log("Saving post failed: " + err.toString());
        } else {
            console.log("Saving post success");
            res.send("Success");
        }
    });
});

// Path for removing a post from the database
app.post("/deletePost", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    if (req.body.id) {
        console.log("Attempting to delete post with id", req.body.id);
        db.collection("posts").remove({
            _id: ObjectID.createFromHexString(req.body.id)
        });
        res.send(JSON.stringify({
            note: "success"
        }));
    } else {
        console.log("No ID for deleting");
        res.send(JSON.stringify({
            error: "No ID attached to request"
        }));
    }
});

// Path to retrieve list of all posts, with the option to specify a specific post id, or a username, to limit the list
app.get("/getPosts", function(req, res) {
    var queryObj = {};
    if (req.query.id) {
        queryObj._id = ObjectID.createFromHexString(req.query.id);
    } else if (req.query.username) {
        queryObj.username = req.query.username;
    }
    db.collection("posts").find(queryObj).toArray(function(err, results) {
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

// Path to remove any images that are not in use, to free disk space
app.get("/removeUnusedImages", function(req, res) {
    console.log("Removing any unsused images...");
    var folder = "./post-images/";
    fs.readdir(folder, function(err, files) {
        files.forEach(function(file) {
            if (file !== "NOIMAGE.png") {
                db.collection("posts").findOne({
                    image: file
                }, function(err, document) {
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
    user.settings = req.body.settings;
    user.trustedIPs = req.body.trustedIPs;

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

// Path to apply a 1-5 rating to a specific user, and calculate their new average rating
app.post("/rateUser", function(req, res) {
    var rater = req.body.me;
    var ratee = req.body.them;
    var rating = req.body.rating;
    if (rater && ratee && rating && rater !== ratee) {
        db.collection("users").find({
            username: ratee
        }).toArray(function(err, results) {
            if (results.length > 0) {
                var user = results[0];
                if (!user.ratings) {
                    user.ratings = {};
                }
                user.ratings[rater] = rating;
                var sum = 0;
                var count = 0;
                for (var username in user.ratings) {
                    sum += Number(user.ratings[username]);
                    count += 1;
                }
                user.rating = Math.round(10 * sum / count) / 10;
                db.collection("users").save(user, function(err, results) {
                    if (err) {
                        res.send(err.toString());
                        console.log("Updating user rating failed: " + err.toString());
                    } else {
                        res.send("Done");
                        console.log("Updating user rating succeeded");
                    }
                });
            }
        });
    }
});

// Path to retrieve a user's average rating
app.get("/getUserRating", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    var user = req.query.username;
    db.collection("users").findOne({
        username: user
    }, function(err, document) {
        res.send(JSON.stringify({
            rating: document.rating,
            username: user
        }));
    });
});

// Path to retrieve the specific rating of one user by another
app.get("/getMyRatingForUser", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    var me = req.query.me;
    var them = req.query.them;
    db.collection("users").findOne({
        username: them
    }, function(err, document) {
        if (!err && document.ratings && document.ratings[me]) {
            res.send(JSON.stringify({
                rating: document.ratings[me],
                user: them
            }));
        } else {
            res.send(JSON.stringify({
                error: "You have not rated this user"
            }));
        }
    });
});

// FUNCTIONS
app.get("/sha1", function(req, res) {
    var inputString = req.query.string;
    if (inputString !== undefined) {
        res.send(sha1(inputString));
    }
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
            db.collection("resetTokens").remove({
                username: tokenData.username
            }, function(err, results) {
                if (err) {
                    console.log("Deleting token failed: " + err.toString());
                } else {
                    console.log("Deleted pre-existing token successfully");
                }
            });
        }

        db.collection("resetTokens").save(tokenData, function(err, results) {
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

app.post("/deleteResetToken", function(req, res) {
    var resetToken = req.body.resetToken;

    db.collection("resetTokens").remove({
        resetToken: resetToken
    }, function(err, results) {
        if (err) {
            res.send(err.toString());
            console.log("Deleting token failed: " + err.toString());
        } else {
            res.send(results);
            console.log("Deleted token successfully");
        }
    });
});

app.post("/cleanResetTokens", function(req, res) {
    db.collection("resetTokens").find().toArray(function(err, results) {

        var currentDate = new Date(Date.now());
        var deleteCount = 0;

        for (var i = 0; i < results.length; i++) {
            var jsonResult = results[i];
            if (jsonResult.expirationDate < currentDate) {
                deleteCount++;
                db.collection("resetTokens").remove({
                    resetToken: jsonResult.resetToken
                }, function(err, results) {
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

// ARCHIVE DATA

app.post("/addArchiveData", function(req, res) {
    var user = {};
    user.set = "set1";

    db.collection("archiveData").save(user, function(err, results) {
        if (err) {
            res.send(err.toString());
            console.log("Saving archive data template failed: " + err.toString());
        } else {
            res.send(results);
            console.log("Saved archive data template successfully");
        }
    });
});

app.get("/getArchiveData", function(req, res) {
    db.collection("archiveData").find().toArray(function(err, results) {
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

app.post("/updateArchiveData", function(req, res) {
    var updateField = req.body.field;
    var newValue = req.body.newValue;
    var updateData = {};
    updateData[updateField] = newValue;
    if (updateField !== undefined && newValue !== undefined) {
        db.collection("archiveData").update(
            {
                "set": "set1"
            }, {
                $set: updateData
            },
            function(err, results) {
            if (err) {
                res.send(err.toString());
                console.log("Updating archive data failed: " + err.toString());
            } else {
                res.send(results);
                console.log("Updating archive data success");
            }
        });
    }
});

// CHAT

app.get("/socket.io/socket.io.js", function(req, res) {
    res.sendFile(path + "/node_modules/socket.io-client/dist/socket.io.js");
});

app.get("/getRooms", function(req, res) {
    var username = req.query.username;
    db.collection("rooms").findOne({
        username: username
    }, function(err, results) {
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

app.get("/getMessages", function(req, res) {
    var room = req.query.room;
    db.collection("messages").findOne({
        room: room
    }, function(err, results) {
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

app.post("/saveMessage", function(req, res) {
    var room = req.body.room;
    var messageData = req.body.messageData;
    // Add this message to the list of messages for this room
    db.collection("messages").update({
        room: room
    }, {
        $push: {
            messages: messageData
        }
    });
    // Check if more than 100 messages are now stored
    db.collection("messages").find({
        room: room
    }).toArray(function(err, results) {
        res.setHeader("Content-Type", "application/json");
        if (err) {
            return;
        } else if (results[0]) {
            res.send(JSON.stringify({
                status: 'success'
            }));
            if (results[0].messages.length > 100) {
                // Sort the messages list by date (ascending), and remove the oldest one (i.e. last, i.e. just pop() it)
                var messages = results[0].messages;
                messages.sort(function(a, b) {
                    var c = new Date(a.date);
                    var d = new Date(b.date);
                    return c - d;
                });
                messages.reverse();
                // Remove messages until the size is at most 100
                while (messages.length > 100) {
                    messages.pop();
                }
                // Save the new message list to the database
                db.collection("messages").update({
                    room: room
                }, {
                    $set: {
                        messages: messages.reverse()
                    }
                });
            }
        }
    });
});

app.post("/addRoom", function(req, res) {
    var user = req.body.user;
    var room = req.body.room;
    // First, add a new document to the messages collection for this room if there isn't one
    db.collection("messages").findOne({
        room: room
    }, function(err, results) {
        if (!results) {
            db.collection("messages").insert({
                room: room,
                messages: []
            });
        }
        // Now, add this room to the rooms list of the user
        db.collection("rooms").findOne({
            username: user
        }, function(err, results) {
            // If no result is found, add an entry for this user
            if (!results) {
                db.collection("rooms").insert({
                    username: user,
                    rooms: []
                });
            }
            // Check if this room is already in the user's list of rooms
            db.collection("rooms").findOne({
                username: user
            }, function(err, results) {
                if (results !== null) {
                    if (results.rooms.indexOf(room) < 0) {
                        // Room is not already stored, so add it
                        db.collection("rooms").update({
                            username: user
                        }, {
                            $push: {
                                rooms: room
                            }
                        }, function(err, results) {
                            if (err) {
                                // Reply with sucess
                                res.send(JSON.stringify({
                                    status: 'failure'
                                }));
                            } else {
                                res.send(JSON.stringify({
                                    status: 'success'
                                }));
                            }
                        });
                    } else {
                        // Reply with success
                        res.send(JSON.stringify({
                            status: 'success'
                        }));
                    }
                } else {
                    // Reply with failure, as something went wrong
                    res.send(JSON.stringify({
                        status: 'failure'
                    }));
                }
            });
        });
    });
});

// PREDICTIONS

app.post("/addPrediction", function(req, res) {
    var prediction = {};
    prediction.username = req.body.user;
    prediction.predicition = req.body.prediction;

    db.collection("predictions").remove({
        username: req.body.user
    }, function(err, results) {
        if (err) {
            console.log("Deleting prediction failed: " + err.toString());
        } else {
            console.log("Deleted prediction successfully");
        }
    });

    db.collection("predictions").save(prediction, function(err, results) {
        if (err) {
            res.send(err.toString());
            console.log("Saving prediction template failed: " + err.toString());
        } else {
            res.send(results);
            console.log("Saved prediction successfully");
        }
    });
});

app.get("/getPredictions", function(req, res) {
    db.collection("predictions").find().toArray(function(err, results) {
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

// IP Auth

// RESET TOKENS

app.post("/addIPAuthToken", function(req, res) {
    var tokenData = {};
    tokenData.IPToken = req.body.IPToken;
    tokenData.username = req.body.username;
    tokenData.ip = req.body.ip;

    db.collection("IPTokens").find().toArray(function(err, results) {

        var tokenExists = false;
        for (var i = 0; i < results.length; i++) {
            var jsonResult = results[i];
            if (jsonResult.username === tokenData.username) {
                tokenExists = true;
            }
        }

        if (tokenExists) {
            db.collection("IPTokens").remove({
                username: tokenData.username
            }, function(err, results) {
                if (err) {
                    console.log("Deleting token failed: " + err.toString());
                } else {
                    console.log("Deleted pre-existing token successfully");
                }
            });
        }

        db.collection("IPTokens").save(tokenData, function(err, results) {
            if (err) {
                res.send(err.toString());
                console.log("Saving IP token failed: " + err.toString());
            } else {
                res.send(results);
                console.log("Saved IP token successfully");
            }
        });
    });

});

app.get("/getIPAuthTokens", function(req, res) {
    db.collection("IPTokens").find().toArray(function(err, results) {
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

app.post("/deleteIPAuthToken", function(req, res) {
    var IPToken = req.body.IPToken;

    db.collection("IPTokens").remove({
        IPToken: IPToken
    }, function(err, results) {
        if (err) {
            res.send(err.toString());
            console.log("Deleting token failed: " + err.toString());
        } else {
            res.send(results);
            console.log("Deleted token successfully");
        }
    });
});

// 404 route, for any unrecognised request
app.get("*", function(req, res) {
    res.redirect('/404.html');
});

//Start server and listen on port 8080, if no port defined (by heroku)
server.listen(process.env.PORT || 8080, function() {
    console.log("Live at port " + (process.env.PORT || "8080"));
});

//Chat stuff
var online_users = [];

io.on('connection', function(socket) {
    var addedUser = false;

    // when the client performs initial handshake, store their username in local variable
    socket.on('handshake', function(username) {
        if (addedUser) {
            return;
        }
        // store the username in the socket session for this client
        socket.username = username;
        online_users.push(username);
        addedUser = true;
        console.log('Handshake completed with ', username);
        socket.emit('login');
    });

    // when the client emits 'joinRoom', this adds the client to that room
    socket.on('joinRoom', function(room) { // TODO - this seems to somehow be bugged in IE
        // Only add socket if it is not already in the room
        if (!socket.rooms[room]) {
            socket.join(room);
            socket.emit('joined', room);
        }
    });

    // when the client emits 'leaveRoom', this removes the client from that room
    socket.on('leaveRoom', function(room) {
        // Only remove socket if it is already in the room
        if (socket.rooms[room]) {
            socket.leave(room);
            socket.emit('left', room);
        }
    });

    // when the client emits 'message', send the msg to the given room
    socket.on('message', function(room, msg) {
        socket.to(room).emit('chat message', socket.username, msg, room);
        // Check if the other user in this room is online. If not, prompt this user to notify that user
        var other_user;
        var room_users = room.split("-");
        if(room_users[0] == socket.username) {
            other_user = room_users[1];
        } else if(room_users[1] == socket.username) {
            other_user = room_users[0];
        } else {
            console.log("Error in chat notification code.");
        }
        if(online_users.indexOf(other_user) < 0) {
            // User is not online, so prompt client to send a notification
            socket.emit('notify', other_user, msg);
        }
    });

    // when the user disconnects, perform this
    socket.on('disconnect', function() {
        if (addedUser) {
            console.log(socket.username, 'disconnected');
            online_users.splice(online_users.indexOf(socket.username), 1);
        }
    });
});

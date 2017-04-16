//Get required packages
var express = require("express");
var sha1 = require('sha1');
var ip = require('ip');
var nodemailer = require('nodemailer');
var uuidV4 = require('uuid/v4');
var MongoClient = require("mongodb").MongoClient;
var ObjectID = require("mongodb").ObjectID;
var fs = require("fs");
var app = express();
var path = __dirname + "/";
var savedRes;
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

//Send initial files to use such as bootstrap
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/less', express.static(__dirname + '/node_modules/bootstrap/dist/less'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/fonts', express.static(__dirname + '/node_modules/bootstrap/fonts'));
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
app.post("/addPost", function(req, res) {
    var post = req.body.postToPost;

    if (post._id && typeof post._id === 'string') {
        post._id = ObjectID.createFromHexString(post._id);
    }

    if (post.image && post.saveImage) {
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
        }
    });
});

app.post("/deletePost", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    if (req.body.id) {
        console.log("Attempting to delete post with id", req.body.id);
        db.collection("posts").remove({
            _id: ObjectID.createFromHexString(req.body.id)
        });
        res.send(JSON.stringify({
            note: "success?"
        }));
    } else {
        console.log("No ID for deleting");
        res.send(JSON.stringify({
            error: "No ID attached to request"
        }));
    }
});

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

// CHAT

app.get("/socket.io/socket.io.js", function(req, res) {
    res.sendFile(path + "/node_modules/socket.io-client/dist/socket.io.js");
});

app.get("/getRooms", function(req, res) {
    var username = req.query.username;
    console.log('Attempting to get rooms for user', username);
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
    console.log('Attempting to get messages for room', room);
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
                if (!err) {
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

app.get("*", function(req, res) {
    res.redirect('/404.html');
});

//Start server and listen on port 8080
server.listen(process.env.PORT || 8080, function() {
    console.log("Live at Port " + (process.env.PORT || "8080"));
});

//Chat stuff
io.on('connection', function(socket) {
    var addedUser = false;

    // when the client performs initial handshake, store their username in local variable
    socket.on('handshake', function(username) {
        if (addedUser) {
            return;
        }
        // store the username in the socket session for this client
        socket.username = username;
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

    // when the client emits 'toggleRoom', remove them if they're in the room, or add them if they're not
    socket.on('toggleRoom', function(room) {
        // Only add socket if it is not already in the room
        if (!socket.rooms[room]) {
            socket.join(room);
            socket.emit('joined', room);
        } // Only remove socket if it is already in the room
        else {
            socket.leave(room);
            socket.emit('left', room);
        }
    });

    // when the client emits 'direct message', send the msg to the given room
    socket.on('direct message', function(room, msg) {
        socket.to(room).emit('chat message', socket.username, msg);
    });

    var addedUser = false;

    // when the client emits 'broadcast message', this listens and executes
    socket.on('broadcast message', function(data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('broadcast message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function() {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function() {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user emits 'getRooms', we respond with a list of the rooms that user is in
    socket.on('getRooms', function() {
        socket.emit('postRooms', socket.rooms);
    });

    // when the user disconnects, perform this
    socket.on('disconnect', function() {
        if (addedUser) {
            console.log(socket.username, 'disconnected');
        }
    });
});

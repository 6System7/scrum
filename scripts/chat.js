// Code partially adapted from source code for socket.io demo at https://github.com/socketio/socket.io/tree/master/examples/chat
$(function() {
  
  // Initialize variables
  var $window = $(window);
  var $messages = $('#messages'); // Messages area
  var $inputMessage = $('#input'); // Input message input box
  var username = localStorage.username;
  var connected = false;
  var date; // Used to add timestamp to messages
  var currentRoom;
  
  // Functions
  
  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      // tell server to execute 'message' to the given room
      if(currentRoom != undefined) {
        addChatMessage({
          username: username,
          message: message
        });
        socket.emit('message', currentRoom, message);
        // store this message in the db
        $.post("/saveMessage", {
          room: currentRoom,
          messageData: {
            username: username,
            message: message,
            date: new Date().getTime()
          }
        });
      } else {
        alert('Please choose a recipient from the list on the left before sending a message.');
      }
    }
    // Return focus to the message input field
    $('#input').focus();
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    //If date is included in data, use this - otherwise, use current date
    if(data.date) {
      date = new Date(Number(data.date));
    } else {
      date = new Date();
    }
    var minutes = date.getMinutes().toString();
    var hours = date.getHours().toString();
    if(minutes.length == 1) {
      minutes = "0" + minutes;
    }
    if(hours.length == 1) {
      hours = "0" + hours;
    }
    var $timeDiv = $('<span>').text(hours + ":" + minutes + ' - ');
    var $usernameDiv = $('<strong/>')
      .text(data.username + ': ');
    var $messageBodyDiv = $('<span>')
      .text(data.message);
    
    // Convert the month number into text
    var month;
    switch(date.getMonth()) {
      case(1):
        month = 'January';
        break;
      case(2):
        month = 'February';
        break;
      case(3):
        month = 'March';
        break;
      case(4):
        month = 'April';
        break;
      case(5):
        month = 'May';
        break;
      case(6):
        month = 'June';
        break;
      case(7):
        month = 'July';
        break;
      case(8):
        month = 'August';
        break;
      case(9):
        month = 'September';
        break;
      case(10):
        month = 'October';
        break;
      case(11):
        month = 'November';
        break;
      case(12):
        month = 'December';
        break;
      default:
        month = date.getMonth();
        break;
    }
    
    // The Date the message was sent is added as hover-information
    var $dateText = date.getDate() + ' ' + month + ' ' + date.getFullYear();

    var $messageDiv = $('<li class="message" title="' + $dateText + '"/>')
      .data('username', data.username)
      .append($timeDiv, $usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $('#messages_div').animate({
      scrollTop: $messages[0].scrollHeight
    }, 0);
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }
  
  // Updates the list of rooms on the page
  function updateRooms (rooms) {
    if(rooms.indexOf(socket.id) >= 0) {
      rooms.splice(rooms.indexOf(socket.id), 1);
    }
    //Clear any previously displayed rooms
    $('#rooms').html('');
    //Display the new topics
    for(var index in rooms){
      // Get the username of the other user in this room from the room's name
      var other_user;
      var room_users = rooms[index].split("-");
      // If this does not produce 2 segments, this room doesn't follow the room naming convention, and thus just display the room name
      if(room_users.length !== 2) {
        other_user = rooms[index];
      } else {
        if(room_users[0] == username) {
          other_user = room_users[1];
        } else if(room_users[1] == username) {
          other_user = room_users[0];
        } else {
          // Room name contains a - but this user's name not found, so just display the room name
          other_user = rooms[index];
        }
      }
      document.getElementById('rooms').innerHTML += '<a id="' + rooms[index] + '" onclick="setItemActive(\'' + rooms[index] + '\'); return false;" class="list-group-item">' + other_user + '</a>';
    }
    // Rooms have now been updated
  }
  
  // Retrieves messages for the given room from the database
  function getMessages(room) {
    // First, clear all messages currently shown
    $('#messages').empty();
    // Next, display the welcome message for this room
    // Get the username of the other user in this room from the room's name
      var other_user;
      var room_users = room.split("-");
      // If this does not produce 2 segments, this room doesn't follow the room naming convention, and thus just display the room name
      if(room_users.length !== 2) {
        other_user = room;
      } else {
        if(room_users[0] == username) {
          other_user = room_users[1];
        } else if(room_users[1] == username) {
          other_user = room_users[0];
        } else {
          // Room name contains a - but this user's name not found, so just display the room name
          other_user = room;
        }
      }
    var message = 'You are now chatting with ' + other_user;
    log(message, {
      prepend: true
    });
    
    // Next, retrieve and display the chat history for this room
    $.get("/getMessages", {room: room}, function(data, status) {
      if(data.error) {
        console.log('Something went wrong when retrieving messages');
      } else {
        // Sort messages by date/time sent
        // Sorting code adapted from http://stackoverflow.com/questions/10123953/sort-javascript-object-array-by-date
        var messages = data.messages;
        messages.sort(function(a, b) {
          a = a.date;
          b = b.date;
          return a<b ? -1 : a>b ? 1 : 0;
        });
        // Display all the messages
        for(var index in messages) {
          addChatMessage(messages[index]);
        }
      }
    });
  }
  
  // Code to retrieve URL parameters taken from http://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
  function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;
    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
  }
  
  // Joins a room and prompts the given user to join it as well
  function connectWithUser(user, callback) {
    var lower_user = user.toLowerCase();
    var lower_self = username.toLowerCase();
    var room;
    // Name the room with the usernames in alphabetical order
    if(lower_user < lower_self) {
      room = user + '-' + username;
    } else {
      room = username + '-' + user;
    }
    // Join the room
    socket.emit('joinRoom', room);
    // Store this in the database
    $.post("addRoom", {
      user: username,
      room: room
    }, function() {
        // Add the other user as well
        $.post("addRoom", {
        user: user,
        room: room
      }, function() {
          callback();
        });
    });
  }
  
  // Initialize the socket connection
  
  var socket = io();
  
  // perform initial handshake with message server
  
  socket.emit('handshake', localStorage.username);
  
  // Check the URL to see if a new chat connection should be established
  
  var contact = getUrlParameter('contact');
  if(contact !== undefined) {
    // Start a chat connection with this user
    console.log('Connecting with user', contact);
    connectWithUser(contact, function() {
      // Retrieve rooms list from the database
      $.get("/getRooms", {username: username}, function(data, status){
        var rooms = data.rooms;
        if(data.error) {
          console.log('Something went wrong when retrieving rooms list');
        } else {
          // Join these rooms
          for(var i = 0; i < rooms.length; i++) {
            socket.emit('joinRoom', rooms[i]);
          }
          // Update the page
          updateRooms(rooms);
        }
      });
    });
  } else {
    // Retrieve rooms list from the database
    $.get("/getRooms", {username: username}, function(data, status){
      var rooms = data.rooms;
      if(data.error) {
        console.log('Something went wrong when retrieving rooms list');
      } else {
        // Join these rooms
        for(var i = 0; i < rooms.length; i++) {
          socket.emit('joinRoom', rooms[i]);
        }
        // Update the page
        updateRooms(rooms);
      }
    });
  }
  
  
  $('form').submit(function(){
    sendMessage();
    return false;
  });

  // Socket events
  
  // When the server emits 'chat message', add this to the list of messages displayed on the screen
  socket.on('chat message', function(username, message, room){
    var data = {
      username: username,
      message: message,
      room: room
    }
    console.log("message data", data);
    // Only display the message if this room is currently selected
    console.log("room comparison:", data.room, currentRoom);
    if(data.room == currentRoom) {
      addChatMessage(data);
    }
  });
  
  socket.on('login', function() {
    connected = true;
    // Display the welcome message
    var message = 'Welcome to the messaging service of SCRUM. To send messages, please select a user from the list on the left. To message a new user, click the \'Message User\' button on a food post.';
    log(message, {
      prepend: true
    });
  });
  
  // When the server emits 'joined', log this and update the page
  socket.on('joined', function (room) {
    console.log('joined,', room);
  });
  
  // When the server emits 'left', log this
  socket.on('left', function (room) {
    console.log('left,', room);
  });
  
  // When the server emits 'notify', send a notification to the given user
  socket.on('notify', function(user, msg) {
    //TODO - call a function from notification.js/globalFunction.js
  });

  $(document).on('click', '#connectButton', function(){
    // Call the global function to connect with user "Tester_One"
    var target = $('#connectInput').val();
    $('#connectInput').val('');
    console.log('Connecting with user', target);
    startChat(target);
  });
  
  // When the user clicks a room in the list, update the currentRoom value and retrieve the messages for the selected room
  $(document).on('click', '.list-group-item', function() {
    currentRoom = $("#rooms").find('.active').first().attr('id');
    //Also retrieve the messages stored for this room
    getMessages(currentRoom);
  });
});

// Code partially adapted from source code for socket.io demo at https://github.com/socketio/socket.io/tree/master/examples/chat
$(function() {
  
  // Initialize variables
  var FADE_TIME = 150; // ms
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
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'broadcast message' and send along one parameter
      socket.emit('broadcast message', message);
      if(currentRoom != undefined) {
        socket.emit('direct message', currentRoom, message);
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
    date = new Date();
    var $timeDiv = $('<span>').text(date.getHours() + ":" + date.getMinutes() + ' - ');
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
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }
  
  // Updates the list of rooms on the page
  function updateRooms (rooms) {
    // Sort the rooms in order of time since last message received/sent
    
    //Clear any previously displayed topics
    document.getElementById('rooms').innerHTML = "";
    //Display the new topics
    for(var index in rooms){
        document.getElementById('rooms').innerHTML += '<a id="' + rooms[index] + '" onclick="setActive(\'' + rooms[index] + '\')" class="list-group-item">' + rooms[index] + '</a>';
    }
    // Rooms have now been updated
  }
  
  // Retrieves messages for the given room from the database
  function getMessages(room) {
    return;
  }
  
  
  // Initialize the socket connection
  
  var socket = io();
  
  // perform initial handshake with message server
  
  socket.emit('handshake', localStorage.username);
  
  $('form').submit(function(){
    sendMessage();
    return false;
  });

  // Socket events
  
  socket.on('chat message', function(user, msg){
    console.log('message received');
    $('#messages').append('<li><strong>' + user + ': </strong>' + msg + '</li>');
    window.scrollTo(0, document.body.scrollHeight);
    console.log("Incoming message:", msg);
  });
  
  socket.on('login', function() {
    connected = true;
    // Display the welcome message
    var message = 'You are now chatting with [User]';
    log(message, {
      prepend: true
    });
  });
  
  // Whenever the server emits 'broadcast message', update the chat body
  socket.on('broadcast message', function (data) {
    addChatMessage(data);
  });
  
  // When the server emits 'postRooms', parse the list of rooms and update the list on the page
  socket.on('postRooms', function (rooms) {
    var rooms_list = [];
    for(var room in rooms) {
      // Omit the socket's ID's room
      if(room != socket.id) {
        rooms_list.push(room);
      }
    }
    // Update the list on the page
    updateRooms(rooms_list);
  });
  
  // When the server emits 'joined', log this
  socket.on('joined', function (room) {
    console.log('joined,', room);
  });
  
  // When the server emits 'left', log this
  socket.on('left', function (room) {
    console.log('left,', room);
  });
  
  // Click events
  
  $(document).on('click', '#room1Button', function(){
    socket.emit('toggleRoom','room1');
  });

  $(document).on('click', '#room2Button', function(){
    socket.emit('toggleRoom','room2');
  });
  
  $(document).on('click', '#updateRooms', function(){
    //socket.emit('toggleRoom','room2');
    socket.emit('getRooms');
  });
  
  // When the user clicks a room in the list, update the currentRoom value and retrieve the messages for the selected room
  $(document).on('click', '.list-group-item', function() {
    currentRoom = $("#rooms").find('.active').first().attr('id');
    //Also retrieve the messages stored for this room
    getMessages(currentRoom);
  });
});
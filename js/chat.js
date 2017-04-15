
var last_id = -1;

// Auto-scroll
function scrollToBottom() {
    $("#chatwrap").scrollTop($("#chatlog")[0].scrollHeight);
}

// Websocket connection
function connect(host, port) {
    // connect to server socket
    var ws = new WebSocket('ws://' + host + ':' + port);
    console.log(ws);
    return ws;
}

function sendMessage(ws) {
    // @DOBA: do something when form is submitted
    message = $('#chat').val();
    if (!message) {
        return;
    }
    $('#chat').val('');
    ws.send(message);
    message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    addChatLog(-1, null, message);
}

function addChatLog(id, username, message) {
    // @DOBA: do something if recieve a [message]
    if ($('.bubble:last-of-type').visible()) {
        scrollToBottom();
    }
    if (username === null) {
        $('#chatlog').append('<div class="bubble me">' + message + '</div>');
    } else {
        var innerMessage = '<div class="bubble other">' + message + '</div>';
        if (id == last_id) {
            var innerUser = '';
        } else {
            var innerUser = '<div class="other-name">' + username + '</div>';
        }
        $('#chatlog').append(
            '<div class="bub-other-group">' + innerUser + innerMessage + '</div>'
        );
    }
    console.log('Message received: ' + message);
    return id;
}

function ready(ws, username, roomname) {
    $('#chatform').submit(function(e) {
        e.preventDefault();
        sendMessage(ws);
    });
    app.loggedIn = true;
    app.typeHere = 'Type and press enter to send';
    $('input#chat').focus();
}

function login(ws, username, roomname) {
    var data = {
        username: username
    }
    ws.send(JSON.stringify(data));
    ws.onmessage = function(event) {
        console.log(event.data);

        var json = JSON.parse(event.data);
        if (json.type == "message") {
            last_id = addChatLog(json.id, json.username, json.message);
        } else if (json.type == "online") {
            app.online = json.users;
        } else if (json.type == "login") {
            if (json.iserror) {
                // display login error
                throw json.errormsg;
            } else {
                console.log("Logged in!")
                ready(ws, username, roomname);
            }
        } else {
            console.log("invalid server response")
        }

    }
}

var config;

$.getJSON('config.json', function(response){
   config = response;
   console.log(config);
})



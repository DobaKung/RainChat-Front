var last_id = -1;
var notiSound = new Audio('noti.mp3');

// Auto-scroll
function scrollToBottom() {
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight);
}

// Websocket connection
function connect(host, port) {
    // connect to server socket
    var ws = new WebSocket('ws://' + host + ':' + port);
    console.log(ws);
    return ws;
}

function addChatLog(id, username, message) {
    // @DOBA: do something if recieve a [message]
    message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (username === null) {
        $('#chatlog').append('<div class="b bubble me">' + message + '</div>');
        scrollToBottom();
    } else {
        var innerMessage = '<div class="bubble other">' + message + '</div>';
        if (id === last_id) {
            var innerUser = '';
        } else {
            var innerUser = '<div class="other-name">' + username + '</div>';
        }
        $('#chatlog').append(
            '<div class="b bub-other-group">' + innerUser + innerMessage + '</div>'
        );
        if ($('.b:last-child').visible()) {
            scrollToBottom();
        }
        if (!document.hasFocus()) {
            notiSound.play();
        }
    }
    console.log('Message received: ' + message);
    return id;
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

function ready(ws, username, roomname) {
    $('#chatform').submit(function(e) {
        e.preventDefault();
        sendMessage(ws);
        last_id = -1;
    });
    app.loggedIn = true;
    app.typeHere = 'Type and press enter to send';
    $('input#chat').focus();
}

function listen(ws, username, roomname, message) {
    // do something when receive message
    console.log(message);
    var json = JSON.parse(message);
    if (json.type === 'message') {
        // plain message
        last_id = addChatLog(json.id, json.username, json.message);
    } else if (json.type === 'online') {
        // online users status
        console.log(json);
        // var notification = document.querySelector('.mdl-js-snackbar');
        if ('added' in json && json.added != username) {
            // do something if user added
            // notification.MaterialSnackbar.showSnackbar({
            //     message: json.added + ' joined the room'
            // });
        }
        if ('removed' in json) {
            // do something if user removed
            // notification.MaterialSnackbar.showSnackbar({
            //     message: json.removed + ' left the room'
            // });
        }
        app.online = json.users;
    } else if (json.type === 'login') {
        // login verification
        if (json.iserror) {
            // display login error
            app.loginErrMsg = json.errormsg;
            throw json.errormsg;
        } else {
            console.log('Logged in!')
            ready(ws, username, roomname);
        }
    } else if (json.type === 'rooms') {
        console.log(json)
    } else {
        console.log('invalid server response')
    }

}

function login(ws, username, roomname) {
    var data = {
        username: username
    }
    console.log(JSON.stringify(data));
    ws.send(JSON.stringify(data));
}

var config;

// Vue

var app = new Vue({
    el: '#app',
    data: {
        ws: null,
        login_count: 0,
        loggedIn: false,
        loginErrMsg: '',
        username: '',
        room: '',
        drawerOpen: false,
        menuOpen: false,
        inputBox: 'Please log in first',
        night: false,
        nightText: "Night mode",
        online: [],
        config: null
    },
    methods: {
        onlineList: function() {
            var rawJson = '{ "type": "online", "count": 0, "users": []}';
            var parsedJson = JSON.parse(rawJson);
            this.online = parsedJson.users;
        },
        checkLogin: function() {
            if (!this.username) {
                this.loginErrMsg = 'Please enter a display name';
            } else if (this.username) {
                this.login_count++;
                if (this.login_count === 1) {
                    this.ws = connect(config.host, config.port); // local
                    this.ws.onopen = function() {
                        login(app.ws, app.username, "global");
                    };
                    this.ws.onmessage = function(event) {
                        listen(app.ws, app.username, app.roomname, event.data);
                    }
                    this.inputBox = 'Type here';
                } else {
                    try {
                        login(this.ws, this.username, "global");
                    } catch (err) {
                        // do something if error on logging in
                        console.log(err);
                    }
                }
            }
        },
        toggleNight: function() {
            $('body').toggleClass('night');
            this.night = !this.night;
            if (this.night === false) {
                this.nightText = 'Night mode';
                $('meta[name="theme-color"]').attr('content', '#00b8ff');
            } else {
                this.nightText = 'Normal';
                $('meta[name="theme-color"]').attr('content', '#000');
            }
        }
    }
});

app.onlineList();

// get configuration
$.getJSON('config.json', function(response) {
    config = response;
    app.config = config;
    console.log(config);
})

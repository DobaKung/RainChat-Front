function scrollToBottom(){$("#chatwrap").scrollTop($("#chatlog")[0].scrollHeight)}function connect(e,n){var o=new WebSocket("ws://"+e+":"+n);return console.log(o),o}function sendMessage(e){message=$("#chat").val(),message&&($("#chat").val(""),e.send(message),message=message.replace(/</g,"&lt;").replace(/>/g,"&gt;"),addChatLog(-1,null,message))}function addChatLog(e,n,o){if(o=o.replace(/</g,"&lt;").replace(/>/g,"&gt;"),$(".bubble:last-of-type").visible()&&scrollToBottom(),null===n)$("#chatlog").append('<div class="bubble me">'+o+"</div>");else{var s='<div class="bubble other">'+o+"</div>";if(e==last_id)var a="";else var a='<div class="other-name">'+n+"</div>";$("#chatlog").append('<div class="bub-other-group">'+a+s+"</div>"),document.hasFocus()||notiSound.play()}return console.log("Message received: "+o),e}function ready(e,n,o){$("#chatform").submit(function(n){n.preventDefault(),sendMessage(e),last_id=-1}),app.loggedIn=!0,app.typeHere="Type and press enter to send",$("input#chat").focus()}function listen(e,n,o,s){console.log(s);var a=JSON.parse(s);if("message"==a.type)last_id=addChatLog(a.id,a.username,a.message);else if("online"==a.type){var t=document.querySelector(".mdl-js-snackbar");"added"in a&&a.added!=n&&t.MaterialSnackbar.showSnackbar({message:a.added+" joined the room"}),"removed"in a&&t.MaterialSnackbar.showSnackbar({message:a.removed+" left the room"}),app.online=a.users}else if("login"==a.type){if(a.iserror){var t=document.querySelector(".mdl-js-snackbar");throw t.MaterialSnackbar.showSnackbar({message:a.errormsg}),a.errormsg}console.log("Logged in!"),ready(e,n,o)}else console.log("invalid server response")}function login(e,n,o){var s={username:n};e.send(JSON.stringify(s))}var last_id=-1,notiSound=new Audio("noti.mp3"),config;$.getJSON("config.json",function(e){config=e,app.config=config,console.log(config)});var app=new Vue({el:"#app",data:{mode:1,ws:null,login_count:0,loggedIn:!1,username:"",room:"",drawerOpen:!1,night:!1,nightText:"Night mode",typeHere:"Please login first",online:[],config:null},methods:{onlineList:function(){var e='{ "type": "online", "count": 0, "users": []}',n=JSON.parse('{ "type": "online", "count": 0, "users": []}');this.online=n.users},checkLogin:function(){if(this.username){if(this.username)if(1==++this.login_count)this.ws=connect(config.host,config.port),this.ws.onopen=function(){login(app.ws,app.username,"global")},this.ws.onmessage=function(e){listen(app.ws,app.username,app.roomname,e.data)};else try{login(this.ws,this.username,"global")}catch(e){console.log(e)}}else{document.querySelector(".mdl-js-snackbar").MaterialSnackbar.showSnackbar({message:"Please enter a display name"})}},toggleNight:function(){$("body").toggleClass("night"),this.night=!this.night,0==this.night?(this.nightText="Night mode",$('meta[name="theme-color"]').attr("content","#00b8ff")):(this.nightText="Normal",$('meta[name="theme-color"]').attr("content","#000"))}}});$("input#login__username").focus(),app.onlineList();
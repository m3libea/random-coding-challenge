var app = require("express")(),
    port = process.env.PORT || 8080,
    http = require("http").Server(app),
    io = require("socket.io")(http),
    express = require("express"),
    fixtures = require("./fixtures/monkey.json"),
    badwords = require("./fixtures/badwords.json"),
    badWordsRegExp = new RegExp(badwords.words.join("|"), "gi");

app.use("/bower_components", express.static(__dirname + "/bower_components"));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/assets/index.html")
});

function filterMsg(msg) {
    return msg.replace(badWordsRegExp, "****");
}

io.on("connection", function(socket){
  console.log("a user connected");
  socket.on('chat message', function(msg){
    io.emit('chat message', {
        user: msg.user, 
        msg: filterMsg(msg.msg)
    });
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

function getRandom(max){
    return Math.floor((Math.random()* max));
}

setInterval(function() {

    for(var i=0; i<1000; i++) {
        var rIdx = getRandom(fixtures.messages.length),
            uIdx = getRandom(fixtures.users.length),
            chat = { 
                user: fixtures.users[uIdx],
                msg: filterMsg(fixtures.messages[rIdx])
            };
        io.emit("chat message", chat);
    }
    
}, 5000);



http.listen(port, function(){
  console.log("listening on *: "+ port);
});
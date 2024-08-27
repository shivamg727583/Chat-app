const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const { prototype } = require('events');


const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Keep track of users and their socket IDs
let username = [];
let userId = [];
let chatMembers = [];

io.on("connection", (socket) => {

    // Handle new user connection with their name
    socket.on("ConnectedName", function(name) {
        username.push(name);
        userId.push(socket.id);
        chatMembers.push(name);
        // Notify all clients about the new user
        io.emit("ConnectedName", name);
        
        // Emit the updated chat members list to all clients
        io.emit('updateChatMembers', chatMembers);
    });

    // Handle incoming messages
    socket.on("message", function(message) {
        var EnteredUser = username[userId.indexOf(socket.id)];
        var id = socket.id;
        io.emit("message", { message, EnteredUser, id });
    });

    socket.on('typing', function(isTyping) {
        let typer = username[userId.indexOf(socket.id)];
        socket.broadcast.emit("typing", { typer, isTyping });
    });

    socket.on('disconnect', () => {
        let index = userId.indexOf(socket.id);
        let disConnectedUser = username[index];
        io.emit("DisconnectName", disConnectedUser);
        
        if (index !== -1) {
            chatMembers = chatMembers.filter(member => member !== username[index]);
            username.splice(index, 1);
            userId.splice(index, 1);
            io.emit('updateChatMembers', chatMembers);
        }
       
    });


});

app.get('/', (req, res) => {
    res.render('index', { chatMembers });
});

server.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});

const path = require('path');
const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
/////////////////////////////////////////
var {generateMessage, generateLocation} = require('./utils/utils');
var {isRealString} = require('./utils/validation');
const {Users} = require('./utils/user');
////////////////////////////////////////////////////////////////////
var app = express();
var server = http.createServer(app);
var io = socketIo(server);
var users = new Users();
///////////////////////////////////////////////////////////////////////
///connect
io.on('connection', (socket) => {
    console.log('new user connection');
    //disconnect
    socket.on('disconnect', () => {
        console.log('user disconnect');

        var user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('admin', `${user.name} has left the ${user.room}`))
        }
    });
    //get
    socket.on('join', (params, callback) => {

        if (!isRealString(params.name) || !isRealString(params.room)) {
            callback('name and room are required');
        }

        socket.join(params.room);

        users.removeUser(socket.id);
        users.addUsers(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room))

        socket.emit('newMessage', generateMessage('adimn', 'welcome to chat app'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('admin', `${params.name} has joined to ${params.room} room`))

        callback();
    })


    socket.on('createMessage', (message, callback) => {
        var user = users.getUser(socket.id);

        if (user && isRealString(message.text)) {

            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text))
        }
        //send to get
        callback();
    });
    socket.on('createLocation', (coords) => {

        var user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('newLocation', generateLocation(user.name, coords.latitude, coords.longitude))
        }

    })
    //send

})


var publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3001;
app.use(express.static(publicPath));


server.listen(port, () => {
    console.log('server port run on ', port);
})

console.log(publicPath)
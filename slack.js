const express =require('express');
const app = express();
const socketio = require('socket.io');

const namespaces = require('./data/namespaces');
const Room = require('./classes/Room');

app.use(express.static(__dirname + '/public',{type: 'application/javascript'}));

const expressServer= app.listen(8000); //handling http trafic
console.log("Server is running on port 8000");
const io = socketio(expressServer); //handling TCP traffic
// app.set('io',io);

//Http to notify TCP that something is changed
app.get('/change-ns',(req,res)=>{
    //update the namespace array
    namespaces[0].addRoom(new Room(0, 'Delete Articles',0));
    // console.log(namespaces[0]);
    //let everyone know if THIS namespace, that it changed
    io.of(namespaces[0].endpoint).emit('nsChange',namespaces[0]);
    res.json(namespaces[0]);
})

io.of('/').on('connection',(socket)=>{
    // socket.on('newMessageToServer', (datafromClient)=>{
    //     console.log("Data: ",datafromClient);
    //     io.emit('newMessagetoClient',{text: datafromClient.text});
    // })
    // console.log("===================");
    // console.log(socket.handshake);
    const userName = socket.handshake.query.userName;

    socket.emit("welcome","Welcome to the Server");
    socket.on('clientConnect',()=>{
        console.log(socket.id, "has connected");
        socket.emit('nsList',namespaces);
    })
})

namespaces.forEach(namespace=>{
    io.of(namespace.endpoint).on('connection',(socket)=>{
        // console.log(`${socket.id} has connected to ${namespace.endpoint}`)
        socket.on('joinRoom', async (roomObj, ackCallback)=>{
            console.log("Joining room",roomObj.roomTitle);

            //fetch the room's history
            const thisNs = namespaces[roomObj.selectedNsId];
            const thisRoomObj = thisNs.rooms.find(room=>room.roomTitle === roomObj.roomTitle);
            const thisRoomHistory = thisRoomObj.history;

            //leave all rooms, because we want to join only one room except for the first one, because the first room is the client's private room
            const rooms = socket.rooms;
            rooms.forEach(room=>{
                if(!(room.id === socket.id)){
                    socket.leave(room);
                }
            })

            const room = namespace.rooms.find(room=>room.roomTitle === roomObj.roomTitle);
            if(room){
                socket.join(roomObj.roomTitle);
                socket.emit('historyCatchUp',room.history);
            }

            const sockets = await io.of(namespace.endpoint).in(roomObj.roomTitle).fetchSockets();
            // console.log(sockets);
            const socketCount = sockets.length;
            ackCallback({
                numUsers: socketCount,
                thisRoomHistory
            });
        })

        socket.on('newMessageToRoom', (data)=>{
            console.log(data);
            
            //boradcast this to all the clients.. this room only
            const rooms = socket.rooms;
            console.log(rooms);
            const currentRoom = [...rooms][0]; //rooms is a set, so we need to convert it to an array
            console.log(currentRoom);
            io.of(namespace.endpoint).in(currentRoom).emit('messageToRoom',data);
            // const roomTitle = Object.keys(socket.rooms)[1];
            // const room = namespace.rooms.find(room=>room.roomTitle === roomTitle);
            // room.addMessage(data);
            // io.of(namespace.endpoint).to(roomTitle).emit('messageToClients',data);

            //add this message to this room's history
            const thisNs = namespaces[data.selectedNsId];
            // console.log(thisNs);
            const thisRoom = thisNs.rooms.find(room=> room.roomTitle === currentRoom);
            console.log(thisRoom);
            thisRoom.addMessage(data);
        })
    })
})
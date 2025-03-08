class Room{
    constructor(roomId, roomTitle,namespaceId, privateRoom = false){
        this.roomId = roomId;
        this.roomTitle = roomTitle;
        this.namespaceId = namespaceId;
        this.privateRoom = privateRoom;
        this.history = []; // Array of messages
    }

    addMessage(message){
        if(this.history.length > 20){
            this.history.shift(); // Remove the first element
        }
        this.history.push(message);
    }

    clearHistory(){
        this.history = [];
    }
}


module.exports = Room;
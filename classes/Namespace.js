class Namespace{
    constructor(id, name, image,endpoint){
        this.id = id;
        this.name = name;
        this.image = image;
        this.endpoint = endpoint;
        this.rooms = []; //we will store the rooms in this namespace
    }

    addRoom(roomobj){
        this.rooms.push(roomobj);
    }
}

module.exports = Namespace;
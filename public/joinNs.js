//We could ask the server for each fresh info on this NS. BAD!!
//We have socket.io/ws, and the server will tell us when something has happened

const joinNs = (element, nsData)=>{
    const nsEndpoint = element.getAttribute('ns');
    // console.log(nsEndpoint);

    const clickedNs = nsData.find(row=>row.endpoint === nsEndpoint);
    selectedNsId = clickedNs.id;
    const rooms = clickedNs.rooms;

    const roomList = document.querySelector('.room-list');
    roomList.innerHTML = "";

    let firstRoom;

    rooms.forEach((room,i)=>{
        if(i===0){
            firstRoom = room.roomTitle;
        }
        console.log(room);
        roomList.innerHTML += `<li class="room"  namespaceId=${room.namespaceId}><span class="fa-solid fa-${room.privateRoom ? "lock" : "globe"}"></span>${room.roomTitle}</li>`
    })

    //init join first room
    joinRoom(firstRoom,clickedNs.id);


    //add click listener to each room
    const roomNodes = document.querySelectorAll(".room");
    Array.from(roomNodes).forEach(element =>{
        element.addEventListener('click', (e)=>{
            console.log("Someone clicked on ",e.target.innerText);

            const namespaceId = element.getAttribute('namespaceId');
            joinRoom(e.target.innerText,namespaceId);
        })
    })

    localStorage.setItem('lastNs',nsEndpoint);
}
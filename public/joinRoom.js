const joinRoom = async(roomTitle, namespaceId)=>{
    console.log("Joining room",roomTitle);
    console.log("Namespace ID",namespaceId);
    const roomObj = {
        roomTitle,
        selectedNsId: namespaceId
    }
    console.log("Room Object",roomObj);
    const ackResp = await nameSpacesSockets[namespaceId].emitWithAck('joinRoom',roomObj);
    console.log(ackResp);
    document.querySelector('.curr-room-num-users').innerHTML = `${ackResp.numUsers} <span class="fa-solid fa-user"></span>`;
    document.querySelector('.curr-room-text').innerText = roomTitle;


    // nameSpacesSockets[namespaceId].emit('joinRoom',roomTitle, (ackResp)=>{
    //     console.log(ackResp);
    //     // curr-room-num-users
    //     document.querySelector('.curr-room-num-users').innerHTML = `${ackResp.numUsers} <span class="fa-solid fa-user"></span>`;
    //     document.querySelector('.curr-room-text').innerText = roomTitle;
    // })

    document.querySelector("#messages").innerHTML = "";
    // console.log(ackResp.thisRoomHistory);
    ackResp.thisRoomHistory.forEach(message=>{
        document.querySelector("#messages").innerHTML += buildMessageHTML(message);
    })
}
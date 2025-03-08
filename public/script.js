// const userName = prompt('What is your username');
// const password = prompt('What is your password');

//temporary hardcoded username and password
const userName = 'admin';
const password = 'admin';

const clientOptions = {
    query: {
        userName,
        password
    },
    auth:{
        userName,
        password
    }
}

const socket = io('http://localhost:8000', clientOptions);

const nameSpacesSockets = [];
const listeners = {
    nsChange: [],
    messageToRoom: []
}
//listeners: an object that keeps track of which namespaces have listeners on them
//listeners.nsChange: an array of booleans that keeps track of which namespaces have listeners on them
//linseners means that the client is listening for a change in the namespace for example, a new room being added or deleted in the namespace

// a global variable we can update when the user on a namespace 
//we will use it to broadcast across the app (redux would be great here)
let selectedNsId = 0;

document.querySelector("#message-form").addEventListener('submit',(e)=>{
    e.preventDefault();
    const newMessage = document.querySelector("#user-message").value;
    console.log(newMessage);
    nameSpacesSockets[selectedNsId].emit('newMessageToRoom',{
        newMessage,
        date: Date.now(),
        avatar: 'https://via.placeholder.com/30',
        userName,
        selectedNsId
    });
    document.querySelector("#user-message").value = "";
})

//addListeners job is to manage all listeners added to all namespaces.
//this prevents listeners being added multiple times and makes life
//better fir us developers
const addListeners = (nsId)=>{
    if(!listeners.nsChange[nsId]){
        nameSpacesSockets[nsId].on('nsChange',(data)=>{ //this line means that the client is listening for a change in the namespace. When the server emits nsChange, the client will log the data
            console.log("Namespace Changed");
            console.log(data);
        })
        listeners.nsChange[nsId] = true; 
    }
    //this function will add a listener to the namespace with the given nsId
    if(!listeners.messageToRoom[nsId]){
        nameSpacesSockets[nsId].on('messageToRoom',(data)=>{
            document.querySelector('#messages').innerHTML += buildMessageHTML(data);
        })
        listeners.messageToRoom[nsId] = true;
    }
}   

socket.on('connect',()=>{
    console.log("Connected");
    socket.emit('clientConnect');
});

socket.on("welcome", (data)=>{
    console.log(data);
})

//listen for the nsList event from the server which gives us the namespaces
socket.on('nsList',(nsData)=>{
    // console.log(nsData);

    const lastNs = localStorage.getItem('lastNs') || nsData[0].endpoint;
    const namespacesDiv = document.querySelector('.namespaces');
    namespacesDiv.innerHTML = "";
    nsData.forEach(ns=>{
        //update the html for each namespaces
        namespacesDiv.innerHTML += `<div class="namespace" ns=${ns.endpoint}><img src=${ns.image}></div>`;

        //initalize thisNs as its index in nameSpacesSockets
        //if the connection is new this will be null
        //if the connection is already established, it will reconnect and remain in its spot
        // let thisNs = nameSpacesSockets[ns.id];
        //join this namespace with io()
        if(!nameSpacesSockets[ns.id]){
            //There is no socket at this nsID, So make a new connection
            //join this namespace with io()
            nameSpacesSockets[ns.id] = io(`http://localhost:8000${ns.endpoint}`);
        }

        addListeners(ns.id);
    })

    Array.from(document.getElementsByClassName('namespace')).forEach(element=>{
        // console.log(element);
        element.addEventListener('click',(e)=>{
            joinNs(element,nsData);
        })
    })
    if(lastNs){
        joinNs(document.querySelector(`.namespace[ns="${lastNs}"]`),nsData);
    }
    else{
        joinNs(namespacesDiv.firstElementChild,nsData);
    }

})


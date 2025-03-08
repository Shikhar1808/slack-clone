const buildMessageHTML = (messageObj)=>{
    console.log(messageObj);
    return`
        <li>
            <div class="user-image">
                <img src="${messageObj.avatar}" />
            </div>
            <div class="user-message">
                <div class="user-name-time">${messageObj.userName} <span>${messageObj.date}</span></div>
                <div class="message-text">${messageObj.newMessage}</div>
            </div>
        </li>
    `
}
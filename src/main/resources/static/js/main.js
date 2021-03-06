'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var newAccountPage = document.querySelector('#create-account-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var sideBar = document.querySelector('#sidebar');

var stompClient = null;
var username = null;
var password = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();
    password = document.querySelector('#password').value;

    if(username && password) {
        usernamePage.classList.add('hidden');
        newAccountPage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        sideBar.classList.remove('hidden');

        var socket = new SockJS('/prime5chatter');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);
    // Tell your username to the server
    stompClient.send("/app/chat.register",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    );

    stompClient.send("/app/chat.createUser",
        {},
        JSON.stringify({sender: username, type: 'NOTAMESSAGE'})
    );
    connectingElement.classList.add('hidden');
}

function goToAccountCreation(event) {
    usernamePage.classList.add('hidden');
    newAccountPage.classList.remove('hidden');
    event.preventDefault();
}

function goToLogin(event){
    newAccountPage.classList.add('hidden');
    usernamePage.classList.remove('hidden');
    event.preventDefault();
}

function createAccount(event) {
    username = document.querySelector('#newUsername').value.trim();
    password = document.querySelector('#newPassword').value;

    if (username && password) {
        usernamePage.classList.add('hidden');
        newAccountPage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        sideBar.classList.remove('hidden');
        var socket = new SockJS('/prime5chatter');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

function onCreateAccount() {


}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function send(event) {
    var messageContent = messageInput.value.trim();

    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    console.log(message);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);



        var timestamp = document.createElement('time');
        timestamp.innerText = message.timestamp;
        messageElement.appendChild(timestamp)

    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}


usernameForm.addEventListener('submit', connect, true);
newAccountPage.addEventListener('submit', createAccount, true);
messageForm.addEventListener('submit', send, true);
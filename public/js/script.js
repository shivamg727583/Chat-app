document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const messageList = document.getElementById('message-list');
    const home = document.querySelector(".homePage");
    const messageInput = document.getElementById('message');
    const MainForm = document.querySelector("#mainForm");
    const ChatForm = document.getElementById("message-form");
    const typingIndicator = document.getElementById("typing");
    const chatMembersSelect = document.getElementById('chat-members');

    const socket = io();
    let userName = '';
    let typingTimer;
    let isTyping = false;

    MainForm.addEventListener("submit", function(event) {
        event.preventDefault();
        home.classList.add('hidden');
        chatContainer.classList.remove('hidden');

        const connectedName = document.getElementById("name").value.trim();
        userName = connectedName;
        socket.emit("ConnectedName", connectedName);
    });

    ChatForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const message = messageInput.value.trim();

        if (message) {
            socket.emit("message", message);
            messageInput.value = "";
        }
    });

    socket.on("message", function(data) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('p-2', 'text-sm', 'w-fit', 'my-1', 'rounded-lg');
        messageElement.innerHTML = `<span class="font-semibold">${data.id === socket.id ? 'You' : data.EnteredUser}</span>: ${data.message}`;

        if (data.id === socket.id) {
            messageElement.classList.add('self-end', 'bg-blue-500', 'text-white');
        } else {
            messageElement.classList.add('self-start', 'bg-gray-300', 'text-gray-800');
        }

        messageList.appendChild(messageElement);
        messageList.scrollTop = messageList.scrollHeight; // Auto-scroll to bottom
    });

    socket.on("ConnectedName", function(name) {
        userName = name;
        messageList.innerHTML += `<div class ="px-3 py-1 text-sm font-light w-fit self-center rounded-md my-1 bg-gray-100"> <strong>${name}</strong> join chat</div>`

    });
    socket.on("DisconnectName", function(name) {
        console.log(name)
        userName = name;
        messageList.innerHTML += `<div class ="px-3 py-1 text-sm font-light w-fit self-center rounded-md my-1 bg-gray-100"><strong>${name}</strong> leave chat</div>`

    });

    socket.on('typing', function({ typer, isTyping }) {
        if (isTyping) {
            typingIndicator.innerHTML = `<span class="text-gray-800">${typer} is typing...</span>`;
        } else {
            typingIndicator.innerHTML = "";
        }
    });

    messageInput.addEventListener("input", function() {
        if (!isTyping) {
            isTyping = true;
            socket.emit("typing", true);
        }
        clearTimeout(typingTimer);

        typingTimer = setTimeout(() => {
            isTyping = false;
            socket.emit("typing", false);
        }, 1000);
    });

    socket.on('updateChatMembers', (members) => {
        chatMembersSelect.innerHTML = ''; // Clear current options
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member;
            option.textContent = member;
            chatMembersSelect.appendChild(option);
        });
    });
});

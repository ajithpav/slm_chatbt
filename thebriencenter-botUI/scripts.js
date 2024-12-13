const fetchUrl = 'http://localhost:5006/webhooks/rest/webhook';

let chatHistory = [];
let currentConversation = [];

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}

function getFormattedDate() {
    const now = new Date();
    return now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function groupConversationsByDate() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const groupedConversations = {
        today: [],
        yesterday: [],
        previous7Days: [],
    };

    chatHistory.forEach(history => {
        const conversationDate = new Date(history.date);
        const timeDifference = today.getTime() - conversationDate.getTime();
        const daysDifference = timeDifference / (1000 * 3600 * 24);

        if (
            conversationDate.getDate() === today.getDate() &&
            conversationDate.getMonth() === today.getMonth() &&
            conversationDate.getFullYear() === today.getFullYear()
        ) {
            groupedConversations.today.push(history);
        } else if (
            conversationDate.getDate() === yesterday.getDate() &&
            conversationDate.getMonth() === yesterday.getMonth() &&
            conversationDate.getFullYear() === yesterday.getFullYear()
        ) {
            groupedConversations.yesterday.push(history);
        } else if (daysDifference <= 7) {
            groupedConversations.previous7Days.push(history);
        }
    });

    return groupedConversations;
}

function getConversationTitle(conversation) {
    if (conversation.length > 0) {
        let title = "General Healthcare Conversation"; // Default title

        conversation.forEach((message, index) => {
            const content = message.content.toLowerCase();

            if (content.includes("experiencing") && content.includes("fever") || content.includes("chills") || content.includes("chest pain") || content.includes("shortness of breath")) {
                // Initial Symptom Check
                if (conversation[index + 1] && conversation[index + 1].content.toLowerCase().includes("yes")) {
                    title = "Urgent Medical Concern";
                } else if (conversation[index + 1] && conversation[index + 1].content.toLowerCase().includes("no")) {
                    title = "Non-Urgent Inquiry";
                }
            } else if (content.includes("prescription refill")) {
                // Prescription Refill Request
                if (conversation[index + 1] && conversation[index + 1].content.toLowerCase().includes("yes")) {
                    title = "Prescription Refill";
                } else if (conversation[index + 1] && conversation[index + 1].content.toLowerCase().includes("no")) {
                    title = "Other Service Request";
                }
            } else if (content.includes("have been seen at the brien center")) {
                // Previous Brien Center Visit
                if (conversation[index + 1] && conversation[index + 1].content.toLowerCase().includes("yes")) {
                    title = "Returning Patient Scheduling";
                } else if (conversation[index + 1] && conversation[index + 1].content.toLowerCase().includes("no")) {
                    title = "New Patient Inquiry";
                }
            } else if (content.includes("location") && content.includes("schedule") && content.includes("appointment")) {
                // Brien Center Location Selection
                title = "Location Preference";
            }
        });

        return title;
    }

    return "Conversation";
}

function updateHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    const groupedConversations = groupConversationsByDate();

    const renderGroup = (group, label) => {
        if (group.length > 0) {
            const groupLabel = document.createElement('li');
            groupLabel.textContent = label;
            groupLabel.style.fontWeight = 'bold';
            groupLabel.style.marginTop = '10px';
            groupLabel.style.marginBottom = '5px';
            historyList.appendChild(groupLabel);

            group.forEach((history, index) => {
                const li = document.createElement('li');
                const conversationTitle = getConversationTitle(history.conversation);
                li.textContent = conversationTitle;
                li.onclick = () => loadConversation(index);
                historyList.appendChild(li);
            });
        }
    };

    renderGroup(groupedConversations.today, 'Today');
    renderGroup(groupedConversations.yesterday, 'Yesterday');
    renderGroup(groupedConversations.previous7Days, 'Previous 7 Days');
}

function loadConversation(index) {
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML = ''; // Clear the chatbox
    chatHistory[index].conversation.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', message.role);
        messageElement.textContent = message.content;
        chatbox.appendChild(messageElement);
    });
    chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom
}

function addToHistory() {
    if (currentConversation.length > 0) {
        const date = getFormattedDate();
        chatHistory.push({
            conversation: [...currentConversation],
            date: date
        }); // Save the current conversation with date
        currentConversation = []; // Reset the current conversation
        updateHistory();
    }
}

function handleButtonClickByPayload(payload, displayText, buttonContainer) {
    const chatbox = document.getElementById('chatbox');
    const userMessage = document.createElement('div');
    userMessage.classList.add('chat-message', 'user');
    userMessage.textContent = displayText;
    chatbox.appendChild(userMessage);

    // Hide the "B" logo and placeholder boxes when a user clicks a button
    const logoElement = document.querySelector('.logo');
    const placeholderBoxes = document.querySelector('.placeholder-boxes');
    if (logoElement) {
        logoElement.style.display = 'none';
    }
    if (placeholderBoxes) {
        placeholderBoxes.classList.add('hidden');
    }

    // Save user message to the current conversation
    currentConversation.push({ role: 'user', content: displayText });

    chatbox.scrollTop = chatbox.scrollHeight;
    buttonContainer.style.display = 'none';
    sendMessage(payload, null);
}

function sendMessage(message, userDisplayText) {
    const chatbox = document.getElementById('chatbox');

    if (userDisplayText) {
        const userMessage = document.createElement('div');
        userMessage.classList.add('chat-message', 'user');
        userMessage.textContent = userDisplayText;
        chatbox.appendChild(userMessage);
        currentConversation.push({ role: 'user', content: userDisplayText });
    }

    chatbox.scrollTop = chatbox.scrollHeight;

    fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sender: 'user', message: message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) {
            const botResponse = document.createElement('div');
            botResponse.classList.add('chat-message', 'bot');
            botResponse.textContent = "Sorry, I could not understand your question. Please try again.";
            chatbox.appendChild(botResponse);
            currentConversation.push({ role: 'bot', content: "Sorry, I could not understand your question. Please try again." });
        } else {
            data.forEach(botMsg => {
                const botResponse = document.createElement('div');
                botResponse.classList.add('chat-message', 'bot');
                botResponse.textContent = botMsg.text;
                chatbox.appendChild(botResponse);
                currentConversation.push({ role: 'bot', content: botMsg.text });

                if (botMsg.buttons && botMsg.buttons.length > 0) {
                    const buttonsContainer = document.createElement('div');
                    buttonsContainer.classList.add('buttons-container');
                    botMsg.buttons.forEach(button => {
                        const buttonElement = document.createElement('button');
                        buttonElement.textContent = button.title;
                        buttonElement.onclick = () => handleButtonClickByPayload(button.payload, button.title, buttonsContainer);
                        buttonsContainer.appendChild(buttonElement);
                    });
                    chatbox.appendChild(buttonsContainer);
                }
            });
        }

        chatbox.scrollTop = chatbox.scrollHeight;
    })
    .catch(error => {
        console.error('Error:', error);
        const botResponse = document.createElement('div');
        botResponse.classList.add('chat-message', 'bot');
        botResponse.textContent = "Sorry, something went wrong. Please try again.";
        chatbox.appendChild(botResponse);
        currentConversation.push({ role: 'bot', content: "Sorry, something went wrong. Please try again." });
    });
}

function startConversation() {
    const chatbox = document.getElementById('chatbox');

    // Hide the "B" logo and placeholder boxes when a user clicks "Click to Start the Conversation"
    const logoElement = document.querySelector('.logo');
    const placeholderBoxes = document.querySelector('.placeholder-boxes');
    if (logoElement) {
        logoElement.style.display = 'none';
    }
    if (placeholderBoxes) {
        placeholderBoxes.classList.add('hidden');
    }

    // Display the initial question and Yes/No buttons
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-message', 'bot');
    botMessage.textContent = "Are you currently experiencing any of the following symptoms: fever, chills, chest pain, or shortness of breath?";
    chatbox.appendChild(botMessage);

    // Store the initial bot message in the current conversation
    currentConversation.push({ role: 'bot', content: botMessage.textContent });

    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('buttons-container');

    const yesButton = document.createElement('button');
    yesButton.textContent = 'Yes';
    yesButton.onclick = () => handleButtonClickByPayload('/affirm_symptom_check', 'Yes', buttonsContainer);

    const noButton = document.createElement('button');
    noButton.textContent = 'No';
    noButton.onclick = () => handleButtonClickByPayload('/deny_symptom_check', 'No', buttonsContainer);

    buttonsContainer.appendChild(yesButton);
    buttonsContainer.appendChild(noButton);

    chatbox.appendChild(buttonsContainer);
    chatbox.scrollTop = chatbox.scrollHeight;
}

window.onload = function() {
    startNewConversation();
}

function startNewConversation() {
    addToHistory(); // Store the last conversation before starting a new one
    const chatbox = document.getElementById('chatbox');
    chatbox.innerHTML = '<div class="logo">B</div> <h3></h3><div class="placeholder-boxes"><div class="placeholder-box clickable" onclick="startConversation()"><div class="icon"><i class="fas fa-comments"></i></div><div class="text">Click to Start the Conversation</div></div><div class="placeholder-box"><div class="icon">🩺</div><div class="text">Schedule a Check-Up</div></div><div class="placeholder-box"><div class="icon">💉</div><div class="text">View Vaccination Records</div></div><div class="placeholder-box"><div class="icon">🏥</div><div class="text">Find a Nearby Clinic</div></div></div>'; // Reset the current chat with "B" logo and placeholder boxes
    currentConversation = []; // Reset the current conversation accumulation
}

document.getElementById('send-btn').addEventListener('click', function() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (message.toLowerCase() === 'hi') {
        startNewConversation(); // Treat "hi" as a new conversation
    } else if (message) {
        sendMessage(message, message);
        input.value = '';
    }
});

document.getElementById('chat-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('send-btn').click();
    }
});

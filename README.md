# Rasa Chatbot for Patient Assistance

This chatbot is built using Rasa to assist patients with symptom checks, prescription refills, and scheduling appointments at The Brien Center (TBC). It also provides an option to connect with a live agent when needed.

## Features
- Symptom check for urgent conditions
- Prescription refill requests
- Appointment scheduling based on patient history
- Live agent handoff when necessary
- Interactive button-based conversation flow

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd rasa-chatbot
   ```
3. Install dependencies:
   ```bash
   pip install rasa
   ```
4. Train the chatbot model:
   ```bash
   rasa train
   ```

## Running the Chatbot
To start the Rasa server, run:
```bash
rasa run --enable-api
```
For interactive conversations in the terminal:
```bash
rasa shell
```

## Intents & Responses
The chatbot supports the following intents:

### 1. `greet`
**Bot Response:**
```
Are you currently experiencing any of the following symptoms: fever, chills, chest pain, or shortness of breath?
```

### 2. `affirm_symptom_check`
**Bot Response:**
```
May I please place you on hold while I check on your request? Please exit the questionnaire and contact the Nursing Supervisor within your office.
```

### 3. `affirm_prescription_refill`
**Bot Response:**
```
Due to the specialized nature of this request, allow me to send a message to one of our staff members. They will return your call to discuss this request by the end of the next business day.
```

### 4. `affirm_seen_last_three_years`
**Bot Response:**
```
Which TBC location should the patient's appointment be scheduled at?
```

Options:
- Adult & Family
- Child & Adolescent
- Community Services

### 5. `fallback`
**Bot Response:**
```
Sorry, I could not understand your question. Please use the above options to start the conversation.
```

## Custom Actions
The chatbot supports a custom action for live agent handoff:
- `action_handoff_to_human`: Transfers the conversation to a human agent.

## Deployment
To deploy the chatbot, consider using Docker or a cloud-based service like AWS, GCP, or Azure. You can also integrate it with messaging platforms like WhatsApp, Slack, or Facebook Messenger.

## Future Enhancements
- Integration with a patient database for better scheduling
- More advanced symptom analysis using AI
- Multi-language support

## License
This project is open-source. Feel free to modify and contribute!

---


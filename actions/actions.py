from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from typing import Any, Text, Dict, List
# from dotenv import load_dotenv
from logging import getLogger
import os
import requests


logger = getLogger(__name__)

# env = os.getenv("ENV", "local")
# env_file = f".env-{env}"
# load_dotenv(dotenv_path=f"../../.env-{env}")

class ActionHandoffToHuman(Action):
    def name(self) -> str:
        return "action_handoff_to_human"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        # Log the event (optional for debugging)
        logger.info(f"Handoff to human triggered by user: {tracker.sender_id}")
        
        # Send a message to the user indicating handoff
        dispatcher.utter_message(text="Connecting you to a live agent...")
        
        # Implement the actual handoff logic here, if needed
        # For example, send a notification to the customer support system
        
        return []
    
# class ActionHandoffToHuman(Action):
#     def name(self) -> str:
#         return "action_handoff_to_human"

#     def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#         # Log the event (optional for debugging)
#         logger.info(f"Handoff to human triggered by user: {tracker.sender_id}")
        
#         # Send a message to the user indicating handoff
#         dispatcher.utter_message(text="Connecting you to a live agent...")

#         # Example: Make an API call to a mock live agent service
#         try:
#             response = requests.post(
#                 "https://run.mocky.io/v3/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",  # Replace with your Mocky.io URL
#                 json={
#                     "user_id": tracker.sender_id,
#                     "message": tracker.latest_message.get('text'),
#                     "metadata": {
#                         "intent": tracker.latest_message['intent'].get('name'),
#                         "slots": tracker.current_slot_values(),
#                     }
#                 },
#                 timeout=10  # Timeout after 10 seconds
#             )
#             response.raise_for_status()  # Raise an exception for HTTP errors
#             data = response.json()

#             if data.get("success"):
#                 dispatcher.utter_message(text="You have been connected to a live agent.")
#                 logger.info(f"User {tracker.sender_id} successfully handed off to live agent.")
#             else:
#                 dispatcher.utter_message(text="Sorry, I couldn't connect you to a live agent at this moment.")
#                 logger.warning(f"Handoff to live agent failed for user {tracker.sender_id}: {data.get('error')}")

#         except requests.exceptions.RequestException as e:
#             dispatcher.utter_message(text="Sorry, something went wrong while trying to connect you to a live agent.")
#             logger.error(f"Error during handoff to live agent for user {tracker.sender_id}: {e}")

#         return []

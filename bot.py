#import every library needed 
import os 
import logging 
import datetime 
import requests 
from flask import Flask, request, jsonify, render_template 
from flask_cors import CORS 
from dotenv import load_dotenv 
import uuid 
#start logging 
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s') 
logger = logging.getLogger(__name__) 
# --- Environment setup --- 
system_prompt = "You are a helpful assistant. Answer the user's question." 
load_dotenv() 
GROQ_API_KEY = os.getenv("GROQ_API_KEY") 
GROQ_API_URL = os.getenv("GROQ_API_URL") 
MODEL = "llama-3.3-70b-versatile" 
# --- Flask app --- 
app = Flask(__name__, static_folder="static", template_folder="templates") 
CORS(app) 
BOT_STATUS = { "status": "Offline",
               "last_updated": datetime.datetime.now().isoformat(), 
               "uptime": "N/A", 
               "details": "Bot is currently offline." 
} 
BOT_START_TIME = None 
def generate_id(): 
    return str(uuid.uuid4()) # --- endpoint routing --- 
    
def update_bot_status(status, details=None):
    global BOT_STATUS, BOT_START_TIME
    if BOT_START_TIME:
        uptime_seconds = (datetime.datetime.now() - BOT_START_TIME).total_seconds()
        hours, remainder = divmod(uptime_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        BOT_STATUS["uptime"] = f"{int(hours)}h {int(minutes)}m {int(seconds)}s"
    else:
        BOT_STATUS["uptime"] = "Not applicable (server not started)"

    BOT_STATUS["status"] = status
    BOT_STATUS["last_updated"] = datetime.datetime.now().isoformat()

    if details:
        BOT_STATUS["details"] = details
    else:
        BOT_STATUS.pop("details", None)

    # --- Main Bot Execution --- 
    # #think how to send the request to the Groq API. 
    # read the api docs. 
    # set up your project. 
    # test the endpoint from the terminal. 
    # write a minimal working request. 
    # check and handle errors. 
    # add timeouts. 
    # implement retries with exponential backoff. 
    # respect rate limits. 
    # handle pagination. 
    # parse and validate responses. 
    # wrap calls in functions.
@app.route("/", methods=['GET', 'POST', 'OPTIONS'])
def home():
    return render_template("chat.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data or "input" not in data:
            return jsonify({"error": "No input provided"}), 400

        user_input = data["input"]
        logger.info(f"Received chat input: {user_input}")

        headers = {
            'Content-Type': 'application/json',
            "Authorization": f"Bearer {GROQ_API_KEY}"
        }

        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            "temperature": 0.7,
            "max_tokens": 150
        }

        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        unique_id = generate_id()

        if response.status_code == 200:
            try:
                data = response.json()
                message_text = data["choices"][0]["message"]["content"]
            except Exception:
                message_text = response.text

            return jsonify({
                "id": unique_id,
                "answer": message_text
            })
        else:
            return jsonify({
                "id": unique_id,
                "error": f"API request failed ({response.status_code})"
            }), response.status_code

    except Exception as e:
        logger.error(f"Error answering question: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500
@app.route('/bot-status', methods=['GET'])
def get_bot_status_endpoint():
    """
    Returns the current status of the bot. This endpoint is polled by the frontend.
    """
    logger.info("Received GET request for /bot-status.")
    # Return the global BOT_STATUS dictionary as JSON.
    return jsonify(BOT_STATUS)
if __name__ == "__main__":
    BOT_START_TIME = datetime.datetime.now()
    update_bot_status("Online", "Server started and bot is ready.")
    logger.info("Starting Flask application...")
    # Run the Flask application.
    # host="0.0.0.0" makes the server accessible from any IP (useful in Docker/cloud environments).
    # port=8080 is the port where the server will listen for incoming requests.
    # debug=True enables debug mode, which provides helpful error messages and auto-reloads the server on code changes.
    app.run(host="0.0.0.0", port=8080, debug=True)

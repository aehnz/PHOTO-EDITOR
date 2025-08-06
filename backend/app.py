from flask import Flask

app = Flask(__name__)

# Importing routes 
from backend.routes import voiceCommand

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

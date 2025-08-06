from flask import Flask

app = Flask(__name__)

# Import routes after app is created to avoid circular imports
from backend.routes import voiceCommand

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

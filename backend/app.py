from flask import Flask

app = Flask(__name__)

# Importing routes 
from backend.routes import voiceCommand
from backend.routes.voiceCommand import voice_command_bp

app.register_blueprint(voice_command_bp)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=1949)

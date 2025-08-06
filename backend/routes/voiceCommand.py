from flask import request, jsonify, send_file
from backend.utilities.utility import parse_command_with_gemini
from backend.functions.rotate import rotate
from backend.functions.crop import crop
from backend.functions.blur import blur
from backend.functions.brightness import brightness
import io

# Import or define your Flask app here
try:
    from app import app  # If your app is defined in app.py
except ImportError:
    from flask import Flask
    app = Flask(__name__)

@app.route('/voice-command', methods=['POST'])
def voice_command():
    # Get command and image from request
    command_text = request.form.get("command", "")
    image_file = request.files.get("image")
    if not image_file:
        return jsonify({"error": "No image provided"}), 400

    image_bytes = image_file.read()
    parsed_action = parse_command_with_gemini(command_text)

    # Robust error handling for parsed_action
    action = parsed_action.get("action")
    if not action or action == "unknown":
        return jsonify({"error": "Unknown or unsupported command"}), 400

    # Call the appropriate function based on action
    if action == "rotate":
        angle = parsed_action.get("angle", 0)
        result = rotate(image_bytes, angle)
    elif action == "crop":
        # Map 'top' to 'upper' and 'bottom' to 'lower' for crop function
        result = crop(
            image_bytes,
            parsed_action.get("left", 0),
            parsed_action.get("top", 0),    # upper
            parsed_action.get("right", 0),
            parsed_action.get("bottom", 0)  # lower
        )
    elif action == "blur":
        radius = parsed_action.get("radius", 2)
        result = blur(image_bytes, radius)
    elif action == "brightness":
        level = parsed_action.get("level", 1.0)
        result = brightness(image_bytes, level)
    else:
        return jsonify({"error": "Unknown or unsupported command"}), 400

    if not result:
        return jsonify({"error": "Image processing failed"}), 500

    return send_file(
        io.BytesIO(result),
        mimetype='image/png',
        as_attachment=False,
        download_name='edited.png'
    )

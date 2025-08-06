from flask import request, jsonify, send_file
from backend.app import app
from backend.utilities.utility import parse_command_with_gemini
from backend.functions.rotate import rotate
from backend.functions.crop import crop
from backend.functions.blur import blur
from backend.functions.brightness import brightness
import io



@app.route('/voice-command', methods=['POST'])
def voice_command():

    commandText = request.form.get("command", "")
    imageFile = request.files.get("image")
    if not imageFile:
        return jsonify({"error": "No image provided"}), 400

    imageBytes = imageFile.read()
    parsedAction = parse_command_with_gemini(commandText)


    action = parsedAction.get("action")
    if not action or action == "unknown":
        return jsonify({"error": "Unknown or unsupported command"}), 400


    if action == "rotate":
        angle = parsedAction.get("angle", 0)
        result = rotate(imageBytes, angle)
    elif action == "crop":

        result = crop(
            imageBytes,
            parsedAction.get("left", 0),
            parsedAction.get("top", 0),    
            parsedAction.get("right", 0),
            parsedAction.get("bottom", 0)  
        )
    elif action == "blur":
        radius = parsedAction.get("radius", 2)
        result = blur(imageBytes, radius)
    elif action == "brightness":
        level = parsedAction.get("level", 1.0)
        result = brightness(imageBytes, level)
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

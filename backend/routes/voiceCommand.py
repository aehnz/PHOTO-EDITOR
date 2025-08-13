from flask import Blueprint, request, jsonify, send_file
from backend.utilities.utility import parse_command_with_gemini, generate_image_from_prompt
from backend.functions.rotate import rotate
from backend.functions.crop import crop
from backend.functions.blur import blur
from backend.functions.brightness import brightness
import io
import logging


voice_command_bp = Blueprint('voice_command_bp', __name__)

# Set up logging
logging.basicConfig(level=logging.INFO)

@voice_command_bp.route('/voice-command', methods=['POST'])
def voice_command():
    commandText = request.form.get("command", "")
    imageFile = request.files.get("image")
    imageBytes = imageFile.read() if imageFile else None
    parsedAction = parse_command_with_gemini(commandText)

    # Log the original command and Gemini's parsed response
    logging.info(f"Voice command received: {commandText}")
    logging.info(f"Gemini parsed response: {parsedAction}")

    action = parsedAction.get("action")
    known_actions = {"rotate", "crop", "blur", "brightness", "generate"}
    if not action or action not in known_actions:
        return jsonify({
            "error": "Unknown or unsupported command. Please try again with a valid action (rotate, crop, blur, brightness, generate).",
            "originalCommand": commandText,
            "geminiParsed": parsedAction
        }), 400

    try:
        if action == "generate":
            prompt = parsedAction.get("prompt") or commandText
            result = generate_image_from_prompt(prompt)
        elif action == "rotate":
            angle = parsedAction.get("angle", 0)
            if not imageBytes:
                return jsonify({"error": "No image provided for rotation"}), 400
            result = rotate(imageBytes, angle)
        elif action == "crop":
            if not imageBytes:
                return jsonify({"error": "No image provided for crop"}), 400
            result = crop(
                imageBytes,
                parsedAction.get("left", 0),
                parsedAction.get("top", 0),    
                parsedAction.get("right", 0),
                parsedAction.get("bottom", 0)  
            )
        elif action == "blur":
            radius = parsedAction.get("radius", 2)
            if not imageBytes:
                return jsonify({"error": "No image provided for blur"}), 400
            result = blur(imageBytes, radius)
        elif action == "brightness":
            level = parsedAction.get("level", 1.0)
            if not imageBytes:
                return jsonify({"error": "No image provided for brightness"}), 400
            result = brightness(imageBytes, level)
        else:
            # This should not be reached due to earlier check
            return jsonify({
                "error": "Unknown command after parsing.",
                "originalCommand": commandText,
                "geminiParsed": parsedAction
            }), 400
    except Exception as e:
        logging.error(f"Error processing image: {e}")
        return jsonify({"error": "Image processing failed", "details": str(e)}), 500

    if not result:
        return jsonify({"error": "Image processing failed"}), 500

    return send_file(
        io.BytesIO(result),
        mimetype='image/png',
        as_attachment=False,
        download_name='edited.png'
    )

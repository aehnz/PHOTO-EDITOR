from flask import Blueprint, request, jsonify, send_file
from utilities.utility import parse_command_with_gemini, generate_image_from_prompt
from functions.rotate import rotate
from functions.crop import crop
from functions.blur import blur
from functions.brightness import brightness
from functions.contrast import contrast
import io
import logging


voice_command_bp = Blueprint('voice_command_bp', __name__)

# Setting up logging
logging.basicConfig(level=logging.INFO)

@voice_command_bp.route('/voice-command', methods=['POST'])
def voice_command():
    commandText = request.form.get("command", "")
    imageFile = request.files.get("image")
    imageBytes = imageFile.read() if imageFile else None
    

    logging.info(f"Raw voice command received: '{commandText}'")
    
    parsedAction = parse_command_with_gemini(commandText)

    
    logging.info(f"Voice command received: {commandText}")
    logging.info(f"Gemini parsed response: {parsedAction}")
    logging.info(f"Parsed action type: {type(parsedAction)}")
    logging.info(f"Parsed action keys: {list(parsedAction.keys()) if isinstance(parsedAction, dict) else 'Not a dict'}")

    action = parsedAction.get("action")
    known_actions = {"rotate", "crop", "blur", "brightness", "contrast", "generate"}
    logging.info(f"Extracted action: '{action}'")
    logging.info(f"Action in known_actions: {action in known_actions}")
    
    if not action or action not in known_actions:
        return jsonify({
            "error": "Unknown or unsupported command. Please try again with a valid action (rotate, crop, blur, brightness, generate).",
            "originalCommand": commandText,
            "geminiParsed": parsedAction,
            "debug_info": {
                "action": action,
                "action_type": type(action).__name__,
                "known_actions": list(known_actions)
            }
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
        elif action == "contrast":
            level = parsedAction.get("level", 1.0)
            if not imageBytes:
                return jsonify({"error": "No image provided for contrast"}), 400
            result = contrast(imageBytes, level)
        else:

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

import os
from dotenv import load_dotenv
from flask import Flask, request, send_file, jsonify, send_from_directory, url_for
from backend.functions.rotate import rotate
from backend.functions.crop import crop
from backend.functions.blur import blur
from backend.functions.brightness import brightness
from flask_cors import CORS
import io
import logging

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

app = Flask(__name__)
CORS(app)

# Importing routes 
from backend.routes import voiceCommand
from backend.routes.voiceCommand import voice_command_bp

app.register_blueprint(voice_command_bp)

SAVE_DIR = os.path.join(os.path.dirname(__file__), 'saved_images')
os.makedirs(SAVE_DIR, exist_ok=True)

@app.route('/images/<path:filename>', methods=['GET'])
def get_saved_image(filename):
    return send_from_directory(SAVE_DIR, filename)

@app.route('/upload-image', methods=['POST'])
def upload_image():
    image_file = request.files.get('image')
    if not image_file:
        return jsonify({'error': 'No image provided'}), 400
    filename = image_file.filename or 'image.png'
    save_path = os.path.join(SAVE_DIR, filename)
    # Ensure unique filename
    base, ext = os.path.splitext(filename)
    counter = 1
    while os.path.exists(save_path):
        filename = f"{base}_{counter}{ext}"
        save_path = os.path.join(SAVE_DIR, filename)
        counter += 1
    image_file.save(save_path)
    file_url = url_for('get_saved_image', filename=filename, _external=True)
    return jsonify({'message': 'Image saved', 'filename': filename, 'url': file_url}), 200

@app.route('/images', methods=['GET'])
def list_images():
    files = [f for f in os.listdir(SAVE_DIR) if os.path.isfile(os.path.join(SAVE_DIR, f))]
    items = [{'filename': f, 'url': url_for('get_saved_image', filename=f, _external=True)} for f in files]
    return jsonify({'images': items})

@app.route('/process-image', methods=['POST'])
def process_image():
    image_file = request.files.get('image')
    operation = request.form.get('operation')
    logging.info(f"Received operation: {operation}")
    logging.info(f"Form data: {dict(request.form)}")
    if not image_file or not operation:
        logging.error('Missing image or operation')
        return jsonify({'error': 'Missing image or operation'}), 400
    image_bytes = image_file.read()
    try:
        if operation == 'rotate':
            angle = float(request.form.get('angle', 0))
            logging.info(f"Rotate angle: {angle}")
            result = rotate(image_bytes, angle)
        elif operation == 'crop':
            x = int(request.form.get('x', 0))
            y = int(request.form.get('y', 0))
            width = int(request.form.get('width', 0))
            height = int(request.form.get('height', 0))
            left = x
            upper = y
            right = x + width
            lower = y + height
            logging.info(f"Crop box: left={left}, upper={upper}, right={right}, lower={lower}")
            result = crop(image_bytes, left, upper, right, lower)
        elif operation == 'blur':
            radius = float(request.form.get('radius', 2))
            logging.info(f"Blur radius: {radius}")
            result = blur(image_bytes, radius)
        elif operation == 'contrast':
            logging.error('Contrast not implemented in backend')
            return jsonify({'error': 'Contrast not implemented in backend'}), 501
        elif operation == 'brightness':
            level = float(request.form.get('level', 1.0))
            logging.info(f"Brightness level: {level}")
            result = brightness(image_bytes, level)
        else:
            logging.error(f"Unknown operation: {operation}")
            return jsonify({'error': 'Unknown operation'}), 400
        if not result:
            logging.error('Image processing failed (empty result)')
            return jsonify({'error': 'Image processing failed'}), 500
        return send_file(
            io.BytesIO(result),
            mimetype='image/png',
            as_attachment=False,
            download_name='edited.png'
        )
    except Exception as e:
        logging.error(f"Exception during processing: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=1949)

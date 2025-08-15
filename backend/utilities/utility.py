import google.generativeai as genai
import json
import os
import base64
try:
    import requests 
except Exception:
    requests = None


api_key = os.getenv("GEMINI_API_KEY")
if not api_key or api_key == "YOUR_GEMINI_API_KEY":
    print("Warning: GEMINI_API_KEY not set or invalid. Will use fallback parsing.")
    api_key = None
else:
    genai.configure(api_key=api_key)
STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")

# Include all actions supported by the voice command endpoint
VALID_ACTIONS = {"rotate", "crop", "blur", "brightness", "contrast", "generate"}

def validate_action_params(action, data):
    if action == "rotate":
        return isinstance(data.get("angle"), (int, float))
    if action == "crop":
        return all(isinstance(data.get(k), (int, float)) for k in ["left", "top", "right", "bottom"])
    if action == "blur":
        return isinstance(data.get("radius"), (int, float))
    if action == "brightness":
        return isinstance(data.get("level"), (int, float))
    if action == "contrast":
        return isinstance(data.get("level"), (int, float))
    if action == "generate":
        prompt = data.get("prompt")
        return isinstance(prompt, str) and len(prompt.strip()) > 0
    return False

def parse_command_with_gemini(user_input):
    """
    Uses Gemini to parse a user command for photo editing and returns a validated action dict.
    Supported actions: rotate, crop, blur, brightness, generate.
    """

    if not api_key:
        print("No Gemini API key available, using fallback parser")
        return parse_command_simple(user_input)
    
    # Try Gemini first, fallback to simple parsing if API key is invalid
    try:
        # Gemini prompt to parse voice commands for photo editing and generation
        prompt = f"""
You are a voice assistant for a photo editing app.

Supported actions:
- "rotate": must include "angle" (0-359). Positive = clockwise, negative = counterclockwise.
- "crop" : must include "left","top","right","bottom"(pixel values)
- "blur": must include "radius" (amount of blur, e.g., 1-100)
- "brightness": must include "level" (brightness factor, e.g., 0.0=black, 1.0=original, >1.0=brighter).
- "generate": create a new image from text. Must include "prompt" (text description).

All numbers must be returned as numbers, not strings.

The user said: "{user_input}"

Examples of voice commands and their JSON responses:
"rotate by 45 degrees" → {{"action": "rotate", "angle": 45}}
"blur the image with radius 10" → {{"action": "blur", "radius": 10}}
"increase brightness by 20%" → {{"action": "brightness", "level": 1.2}}
"generate a beautiful sunset landscape" → {{"action": "generate", "prompt": "a beautiful sunset landscape"}}

Return a JSON object like:
{{
  "action": "rotate",
  "angle": 45
}}
OR
{{
  "action": "brightness",
  "level": 1.2
}}
OR
{{
  "action": "crop",
  "left": 10,
  "top": 20,
  "right": 30,
  "bottom": 40
}}
OR
{{
  "action": "blur",
  "radius": 10
}}
OR
{{
  "action": "generate",
  "prompt": "a photorealistic golden retriever puppy playing in a field at sunset"
}}
If the command is invalid, unrelated, or not supported, return:
{{ "action": "unknown" }}

Only respond with valid JSON. No explanation. No markdown.
"""

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        print(f"Gemini raw response: {response_text}")

        # Be tolerant to occasional code-fence wrapping or extra text
        cleaned = response_text
        if cleaned.startswith("```"):
            # Remove leading ``` and optional language, then strip trailing ```
            parts = cleaned.split("\n", 1)
            cleaned = parts[1] if len(parts) > 1 else cleaned
            if cleaned.endswith("```"):
                cleaned = cleaned[: -3]
            cleaned = cleaned.strip()
        # If still not pure JSON, attempt to extract JSON object boundaries
        try:
            data = json.loads(cleaned)
        except Exception:
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1 and end > start:
                candidate = cleaned[start:end+1]
                data = json.loads(candidate)
            else:
                raise
        action = data.get("action", "unknown")

        if action not in VALID_ACTIONS or not validate_action_params(action, data):
            return { "action": "unknown" }

        return data

    except Exception as e:
        print(f"Gemini parsing error: {e}")
        # Fallback to simple parsing
        return parse_command_simple(user_input)


def parse_command_simple(user_input):
    """
    Simple fallback parser for basic voice commands when Gemini is unavailable.
    """
    input_lower = user_input.lower().strip()
    print(f"Fallback parser processing: '{user_input}' -> '{input_lower}'")
    
    # Rotate commands
    if "rotate" in input_lower:
        import re
        angle_match = re.search(r'(-?\d+)', input_lower)
        if angle_match:
            angle = int(angle_match.group(1))
            return {"action": "rotate", "angle": angle}
    
    # Blur commands
    if "blur" in input_lower:
        import re
        radius_match = re.search(r'(-?\d+)', input_lower)
        if radius_match:
            radius = int(radius_match.group(1))
            return {"action": "blur", "radius": radius}
    
    # Brightness commands
    if "brightness" in input_lower or "brighten" in input_lower:
        import re
        level_match = re.search(r'(\d+)', input_lower)
        if level_match:
            level = int(level_match.group(1)) / 100.0
            return {"action": "brightness", "level": level}

    # Contrast commands
    if "contrast" in input_lower:
        import re
        level_match = re.search(r'(\d+)', input_lower)
        if level_match:
            level = int(level_match.group(1)) / 100.0
            return {"action": "contrast", "level": level}
    
    # Crop commands (expects phrases like: crop left 10 top 20 right 30 bottom 40)
    if "crop" in input_lower:
        import re
        coords = {}
        for key in ["left", "top", "right", "bottom"]:
            match = re.search(rf"{key}[^0-9-]*(-?\\d+)", input_lower)
            if match:
                coords[key] = int(match.group(1))
        if all(k in coords for k in ["left", "top", "right", "bottom"]):
            return {
                "action": "crop",
                "left": coords["left"],
                "top": coords["top"],
                "right": coords["right"],
                "bottom": coords["bottom"],
            }

    # Generate commands
    if "generate" in input_lower or "create" in input_lower or "make" in input_lower:
        # Extract everything after the first keyword
        for keyword in ["generate", "create", "make"]:
            if keyword in input_lower:
                prompt_start = input_lower.find(keyword) + len(keyword)
                prompt = user_input[prompt_start:].strip()
                if prompt:
                    return {"action": "generate", "prompt": prompt}
    
    print(f"Fallback parser: no match found for '{input_lower}'")
    return {"action": "unknown"}

def generate_image_from_prompt(prompt: str) -> bytes:
    """
    Generate an image from a text prompt using Stability AI's SDXL API if configured.
    Returns PNG bytes.
    """
    if not STABILITY_API_KEY:
        raise RuntimeError("Text-to-image provider not configured. Please set STABILITY_API_KEY.")
    if requests is None:
        raise RuntimeError("The 'requests' library is required for text-to-image generation.")

    url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024x1024/text-to-image"
    headers = {
        "Authorization": f"Bearer {STABILITY_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "text_prompts": [{"text": prompt}],
        "cfg_scale": 7,
        "clip_guidance_preset": "FAST_BLUE",
        "height": 1024,
        "width": 1024,
        "samples": 1,
        "steps": 30,
    }
    response = requests.post(url, headers=headers, json=payload, timeout=90)
    response.raise_for_status()
    data = response.json()
    artifacts = data.get("artifacts") or []
    if not artifacts:
        raise RuntimeError("No image artifacts returned from provider")
    image_base64 = artifacts[0].get("base64")
    if not image_base64:
        raise RuntimeError("Provider response missing base64 image data")
    return base64.b64decode(image_base64)

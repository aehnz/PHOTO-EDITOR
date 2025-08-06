import google.generativeai as genai
import json
import os

# Configuring Gemini API key
# Using environment variable for security
api_key = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
genai.configure(api_key=api_key)

VALID_ACTIONS = {"rotate", "crop", "blur", "brightness"}

def validate_action_params(action, data):
    if action == "rotate":
        return isinstance(data.get("angle"), (int, float))
    if action == "crop":
        return all(isinstance(data.get(k), (int, float)) for k in ["left", "top", "right", "bottom"])
    if action == "blur":
        return isinstance(data.get("radius"), (int, float))
    if action == "brightness":
        return isinstance(data.get("level"), (int, float))
    return False

def parse_command_with_gemini(user_input):
    """
    Uses Gemini to parse a user command for photo editing and returns a validated action dict.
    Supported actions: rotate, crop, blur, brightness.
    """
    # Gemini prompt to parse only the 4 allowed editing commands
    prompt = f"""
You are a voice assistant for a photo editing app.

Supported actions:
- "rotate": must include "angle" (0–359). Positive = clockwise, negative = counterclockwise.
- "crop" : must include "left","top","right","bottom"(pixel values)
- "blur": must include "radius" (amount of blur, e.g., 1-100)
- "brightness": must include "level" (brightness factor, e.g., 0.0=black, 1.0=original, >1.0=brighter).

All numbers must be returned as numbers, not strings.

The user said: "{user_input}"

Return a JSON object like:
{
  "action": "rotate",
  "angle": 45
}
OR
{
  "action": "brightness",
  "level": 1.2
}
OR
{
  "action": "crop",
  "left": 10,
  "top": 20,
  "right": 30,
  "bottom": 40
}
OR
{
  "action": "blur",
  "radius": 10
}
If the command is invalid, unrelated, or not supported, return:
{{ "action": "unknown" }}

Only respond with valid JSON. No explanation. No markdown.
"""

    model = genai.GenerativeModel("gemini-pro")

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        print(f"Gemini raw response: {response_text}")

        # Try to parse the JSON Gemini sends back
        data = json.loads(response_text)
        action = data.get("action", "unknown")

        if action not in VALID_ACTIONS or not validate_action_params(action, data):
            return { "action": "unknown" }

        return data

    except Exception as e:
        print(f"Gemini parsing error: {e}")
        return { "action": "unknown" }


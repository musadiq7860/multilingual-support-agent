import os
from dotenv import load_dotenv
from google import genai

load_dotenv(override=True)

api_key = os.getenv("GEMINI_API_KEY")
import sys
with open("models_result.log", "w", encoding="utf-8") as f:
    f.write(f"Testing with API Key starting with: {api_key[:10] if api_key else 'None'}\n")

    client = genai.Client(api_key=api_key)

    models_to_test = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]

    for model_name in models_to_test:
        f.write(f"\n--- Testing {model_name} ---\n")
        try:
            response = client.models.generate_content(
                model=model_name,
                contents="Say hello"
            )
            f.write(f"SUCCESS! Response: {response.text.strip()}\n")
        except Exception as e:
            f.write(f"ERROR: {e}\n")

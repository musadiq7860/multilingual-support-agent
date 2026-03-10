import os
import json
from dotenv import load_dotenv

load_dotenv(override=True)

TOXICITY_KEYWORDS = [
    "fuck", "shit", "bitch", "bastard", "asshole", "dick", "pussy",
    "nigger", "faggot", "retard", "chutiya", "madarchod", "behenchod",
    "gandu", "harami", "sala", "lund", "maa ki", "teri maa", "bhen ke",
    "randi", "kutti", "ullu", "bakwaas"
]

def is_toxic(text: str) -> bool:
    text_lower = text.lower()
    return any(word in text_lower for word in TOXICITY_KEYWORDS)

def analyze_with_groq(text: str) -> dict:
    from groq import Groq
    # Try using Groq
    if is_toxic(text):
        return {
            "language": {"language": "detected", "confidence": 100},
            "translation": {"translated": text, "method": "none"},
            "intent": {"intent": "complaint", "confidence": 100},
            "sentiment": {"sentiment": "negative", "confidence": 100},
            "urgency": "high",
            "reply": {"reply": "We have received your message. Please note that abusive language is not tolerated. Our team will review your concern and respond professionally."}
        }

    prompt = f"""
You are an AI customer support analyzer. Analyze the following customer message and return a JSON response.

Customer message: "{text}"

Instructions:
- Detect the language (return the language name in lowercase, e.g. "english", "urdu", "roman_urdu", "arabic", "french", "punjabi", etc.)
- Translate to English if not already in English
- Classify intent as one of: "billing", "technical support", "refund", "complaint", "general inquiry", "compliment"
- Analyze sentiment as one of: "positive", "neutral", "negative"
- Set urgency as "high" if the issue is serious (outage, fraud, urgent complaint) else "normal"
- Write a warm, empathetic, human-sounding reply in the SAME language as the original message
- Confidence scores should be between 0-100

Return ONLY valid JSON in this exact format, no extra text:
{{
  "language": {{
    "language": "english",
    "confidence": 95
  }},
  "translation": {{
    "translated": "english version of the message",
    "method": "groq"
  }},
  "intent": {{
    "intent": "technical support",
    "confidence": 88
  }},
  "sentiment": {{
    "sentiment": "negative",
    "confidence": 91
  }},
  "urgency": "high",
  "reply": {{
    "reply": "warm empathetic reply in original language"
  }}
}}
"""

    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.0,
            response_format={"type": "json_object"}
        )

        raw = chat_completion.choices[0].message.content or ""
        
        # Parse standard JSON
        return json.loads(raw)

    except Exception as e:
        error_msg = str(e)
        print(f"Groq API Error: {error_msg}")
        return {
            "language": {"language": "unknown", "confidence": 0},
            "translation": {"translated": text, "method": f"error: {error_msg}"},
            "intent": {"intent": "general inquiry", "confidence": 0},
            "sentiment": {"sentiment": "neutral", "confidence": 0},
            "urgency": "normal",
            "reply": {"reply": f"SYSTEM ERROR: {error_msg}"}
        }
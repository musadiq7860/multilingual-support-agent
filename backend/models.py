import requests
import os
from dotenv import load_dotenv
import time
from deep_translator import GoogleTranslator

load_dotenv()
HF_API_KEY = os.getenv("HF_API_KEY")
HEADERS = {"Authorization": f"Bearer {HF_API_KEY}"}
BASE_URL = "https://router.huggingface.co/hf-inference/models"

ROMAN_URDU_KEYWORDS = [
    "mujhe", "meri", "mere", "hai", "hain", "nahi", "nahin", "karo",
    "karna", "chahiye", "paisa", "paise", "wapas", "band", "chalu",
    "kaam", "theek", "problem", "dikkat", "mushkil", "bhejo",
    "batao", "kab", "kyun", "kaise", "abhi", "kal", "aaj"
]

INTENT_REPLIES = {
    "billing": "Your billing issue has been received and assigned to our finance team. We will resolve it within 24 hours.",
    "technical support": "Our technical team has been notified about your issue. We will get back to you shortly.",
    "refund": "Your refund request has been received. Our finance team will process it within 3 working days.",
    "complaint": "We sincerely apologize for your experience. Your complaint has been escalated to our customer relations team.",
    "general inquiry": "Thank you for reaching out. Our support team will respond to your inquiry shortly."
}

def is_roman_urdu(text):
    text_lower = text.lower()
    matches = sum(1 for word in ROMAN_URDU_KEYWORDS if word in text_lower)
    return matches >= 2

def detect_language(text):
    API_URL = f"{BASE_URL}/papluca/xlm-roberta-base-language-detection"
    try:
        response = requests.post(API_URL, headers=HEADERS, json={"inputs": text})
        if not response.text.strip():
            return {"error": "Empty response from API"}
        result = response.json()
        if isinstance(result, list) and isinstance(result[0], list):
            top = max(result[0], key=lambda x: x['score'])
        elif isinstance(result, list) and isinstance(result[0], dict):
            top = max(result, key=lambda x: x['score'])
        else:
            return {"error": str(result)}
        detected = top['label']
        if detected in ["en", "hi"] and is_roman_urdu(text):
            detected = "roman_urdu"
        return {
            "language": detected,
            "confidence": round(top['score'] * 100, 2)
        }
    except Exception as e:
        return {"error": str(e)}

def translate_to_english(text, src_lang):
    if src_lang in ["roman_urdu", "en", "hi"]:
        try:
            result = GoogleTranslator(source='auto', target='en').translate(text)
            return {"translated": result, "method": "google"}
        except Exception as e:
            return {"error": str(e)}
    API_URL = f"{BASE_URL}/Helsinki-NLP/opus-mt-{src_lang}-en"
    try:
        response = requests.post(API_URL, headers=HEADERS, json={"inputs": text})
        if not response.text.strip():
            return {"error": "Empty response from API"}
        result = response.json()
        if isinstance(result, list):
            return {"translated": result[0]['translation_text'], "method": "huggingface"}
        return {"error": str(result)}
    except Exception as e:
        return {"error": str(e)}

def classify_intent(text):
    API_URL = f"{BASE_URL}/facebook/bart-large-mnli"
    labels = ["billing", "technical support", "refund", "complaint", "general inquiry"]
    try:
        response = requests.post(API_URL, headers=HEADERS, json={
            "inputs": text,
            "parameters": {"candidate_labels": labels}
        })
        if not response.text.strip():
            return {"error": "Empty response from API"}
        result = response.json()
        if isinstance(result, list):
            result = result[0]
        if isinstance(result, dict) and "label" in result:
            return {
                "intent": result['label'],
                "confidence": round(result['score'] * 100, 2)
            }
        if isinstance(result, dict) and "labels" in result:
            return {
                "intent": result['labels'][0],
                "confidence": round(result['scores'][0] * 100, 2)
            }
        return {"error": str(result)}
    except Exception as e:
        return {"error": str(e)}

def analyze_sentiment(text):
    API_URL = f"{BASE_URL}/cardiffnlp/twitter-roberta-base-sentiment"
    try:
        response = requests.post(API_URL, headers=HEADERS, json={"inputs": text})
        if not response.text.strip():
            return {"error": "Empty response from API"}
        result = response.json()
        if isinstance(result, list) and isinstance(result[0], list):
            top = max(result[0], key=lambda x: x['score'])
        elif isinstance(result, list) and isinstance(result[0], dict):
            top = max(result, key=lambda x: x['score'])
        else:
            return {"error": str(result)}
        label_map = {"LABEL_0": "negative", "LABEL_1": "neutral", "LABEL_2": "positive"}
        return {
            "sentiment": label_map.get(top['label'], top['label']),
            "confidence": round(top['score'] * 100, 2)
        }
    except Exception as e:
        return {"error": str(e)}

def translate_reply(intent, target_lang):
    reply_en = INTENT_REPLIES.get(intent, INTENT_REPLIES["general inquiry"])
    if target_lang in ["en", "roman_urdu"]:
        return {"reply": reply_en}
    try:
        result = GoogleTranslator(source='en', target=target_lang).translate(reply_en)
        return {"reply": result}
    except Exception as e:
        return {"reply": reply_en}

if __name__ == "__main__":
    tests = [
        "مجھے رقم واپس چاہیے",
        "mujhe paisa wapas chahiye",
        "My Internet doesn't work",
        "Mon internet ne fonctionne pas",
        "Mi factura está incorrecta",
    ]

    for text in tests:
        lang_result = detect_language(text)
        lang = lang_result.get("language", "en")
        translation = translate_to_english(text, lang)
        translated_text = translation.get("translated", text)
        intent = classify_intent(translated_text)
        sentiment = analyze_sentiment(translated_text)
        intent_label = intent.get("intent", "general inquiry")
        reply = translate_reply(intent_label, lang)
        print(f"Original: {text}")
        print(f"Language: {lang_result}")
        print(f"Translated: {translation}")
        print(f"Intent: {intent}")
        print(f"Sentiment: {sentiment}")
        print(f"Reply: {reply}")
        print("-" * 50)
        time.sleep(2)
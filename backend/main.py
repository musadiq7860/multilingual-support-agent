from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from models import detect_language, translate_to_english, classify_intent, analyze_sentiment, translate_reply
from database import create_customer, get_customer_by_email, create_ticket, get_tickets_by_customer, get_all_tickets, update_ticket_status
import bcrypt
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "multilingual_support_secret_2026")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RegisterInput(BaseModel):
    name: str
    email: str
    password: str
    phone: str = None

class LoginInput(BaseModel):
    email: str
    password: str

class Message(BaseModel):
    text: str

class StatusUpdate(BaseModel):
    status: str

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
def root():
    return {"status": "Multilingual Support Agent is running"}

@app.post("/register")
def register(data: RegisterInput):
    existing = get_customer_by_email(data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    password_hash = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    customer = create_customer(data.name, data.email, password_hash, data.phone)
    return {"message": "Account created successfully", "customer": customer}

@app.post("/login")
def login(data: LoginInput):
    customer = get_customer_by_email(data.email)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if not bcrypt.checkpw(data.password.encode(), customer["password"].encode()):
        raise HTTPException(status_code=401, detail="Wrong password")
    token = jwt.encode({"id": customer["id"], "email": customer["email"], "name": customer["name"]}, JWT_SECRET, algorithm="HS256")
    return {"token": token, "name": customer["name"], "email": customer["email"]}

@app.post("/analyze")
def analyze(message: Message, user=Depends(verify_token)):
    text = message.text

    lang_result = detect_language(text)
    lang = lang_result.get("language", "en")

    translation = translate_to_english(text, lang)
    translated_text = translation.get("translated", text)

    intent = classify_intent(translated_text)
    sentiment = analyze_sentiment(translated_text)

    intent_label = intent.get("intent", "general inquiry")
    reply = translate_reply(intent_label, lang)

    urgency = "high" if sentiment.get("sentiment") == "negative" and intent_label in ["billing", "refund", "complaint"] else "normal"

    ticket = create_ticket(
        customer_id=user["id"],
        original_message=text,
        language=lang,
        translated_text=translated_text,
        intent=intent_label,
        sentiment=sentiment.get("sentiment", "neutral"),
        urgency=urgency,
        reply=reply.get("reply", "")
    )

    return JSONResponse(content={
        "original": text,
        "language": lang_result,
        "translation": translation,
        "intent": intent,
        "sentiment": sentiment,
        "urgency": urgency,
        "reply": reply,
        "ticket": ticket
    })

@app.get("/tickets/me")
def my_tickets(user=Depends(verify_token)):
    tickets = get_tickets_by_customer(user["id"])
    return {"tickets": tickets}

@app.get("/tickets/all")
def all_tickets(user=Depends(verify_token)):
    tickets = get_all_tickets()
    return {"tickets": tickets}

@app.put("/tickets/{ticket_id}/status")
def update_status(ticket_id: str, data: StatusUpdate, user=Depends(verify_token)):
    result = update_ticket_status(ticket_id, data.status)
    return {"message": "Status updated", "ticket": result}
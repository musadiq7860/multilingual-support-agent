from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
import bcrypt
import os
import requests
from dotenv import load_dotenv
from database import create_customer, get_customer_by_email, create_ticket, get_tickets_by_customer, get_all_tickets, update_ticket_status
from models import analyze_with_groq

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "multilingual_support_secret_2026")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: str = ""

class LoginRequest(BaseModel):
    email: str
    password: str

class AnalyzeRequest(BaseModel):
    text: str

class StatusRequest(BaseModel):
    status: str

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
def root():
    return {"status": "Multilingual Support Agent is running", "groq_key_loaded": bool(os.getenv("GROQ_API_KEY"))}

@app.post("/register")
def register(req: RegisterRequest):
    existing = get_customer_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt()).decode()
    customer = create_customer(req.name, req.email, hashed, req.phone)
    return {"message": "Account created successfully", "customer": customer}

@app.post("/login")
def login(req: LoginRequest):
    customer = get_customer_by_email(req.email)
    if not customer:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not bcrypt.checkpw(req.password.encode(), customer["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = jwt.encode({"id": customer["id"], "email": customer["email"], "name": customer["name"]}, JWT_SECRET, algorithm="HS256")
    return {"token": token, "name": customer["name"], "email": customer["email"]}

def send_to_n8n(ticket_data: dict):
    webhook_url = os.getenv("N8N_WEBHOOK_URL")
    auth_secret = os.getenv("N8N_AUTH_SECRET")
    
    if not webhook_url or not auth_secret:
        print("n8n webhook configuration missing. Skipping webhook.")
        return
        
    headers = {
        "Authorization": f"Bearer {auth_secret}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(webhook_url, json=ticket_data, headers=headers)
        response.raise_for_status()
        print(f"Successfully sent ticket {ticket_data.get('id')} to n8n.")
    except Exception as e:
        print(f"Failed to send ticket to n8n: {e}")

@app.post("/analyze")
def analyze(req: AnalyzeRequest, background_tasks: BackgroundTasks, user=Depends(get_current_user)):
    try:
        result = analyze_with_groq(req.text)
        ticket = create_ticket(
            customer_id=user["id"],
            original_message=req.text,
            language=result["language"]["language"],
            translated_text=result["translation"]["translated"],
            intent=result["intent"]["intent"],
            sentiment=result["sentiment"]["sentiment"],
            urgency=result["urgency"],
            reply=result["reply"]["reply"]
        )
        ticket_data = ticket[0] if isinstance(ticket, list) and len(ticket) > 0 else ticket
        background_tasks.add_task(send_to_n8n, ticket_data)
        
        return {
            "original": req.text,
            "language": result["language"],
            "translation": result["translation"],
            "intent": result["intent"],
            "sentiment": result["sentiment"],
            "urgency": result["urgency"],
            "reply": result["reply"],
            "ticket": ticket
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "traceback": traceback.format_exc()}

@app.get("/tickets/me")
def my_tickets(user=Depends(get_current_user)):
    tickets = get_tickets_by_customer(user["id"])
    return {"tickets": tickets}

@app.get("/tickets/all")
def all_tickets(user=Depends(get_current_user)):
    tickets = get_all_tickets()
    return {"tickets": tickets}

@app.put("/tickets/{ticket_id}/status")
def update_status(ticket_id: str, req: StatusRequest, user=Depends(get_current_user)):
    ticket = update_ticket_status(ticket_id, req.status)
    return {"ticket": ticket}
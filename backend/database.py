import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def create_customer(name, email, password_hash, phone=None):
    result = supabase.table("customers").insert({
        "name": name,
        "email": email,
        "password": password_hash,
        "phone": phone
    }).execute()
    return result.data

def get_customer_by_email(email):
    result = supabase.table("customers").select("*").eq("email", email).execute()
    return result.data[0] if result.data else None

def create_ticket(customer_id, original_message, language, translated_text, intent, sentiment, urgency, reply):
    result = supabase.table("tickets").insert({
        "customer_id": customer_id,
        "original_message": original_message,
        "language": language,
        "translated_text": translated_text,
        "intent": intent,
        "sentiment": sentiment,
        "urgency": urgency,
        "reply": reply,
        "status": "open"
    }).execute()
    return result.data

def get_tickets_by_customer(customer_id):
    result = supabase.table("tickets").select("*").eq("customer_id", customer_id).order("created_at", desc=True).execute()
    return result.data

def get_all_tickets():
    result = supabase.table("tickets").select("*, customers(name, email)").order("created_at", desc=True).execute()
    return result.data

def update_ticket_status(ticket_id, status):
    result = supabase.table("tickets").update({"status": status}).eq("id", ticket_id).execute()
    return result.data
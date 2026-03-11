# Multilingual Customer Support Agent

An AI-powered customer support triage system that understands complaints in any language — Urdu, Arabic, French, English, and more — and automatically classifies intent, sentiment, and urgency using the lightning-fast Groq LLaMA 3.3 model.

## Live Demo
- **Frontend (Vercel)**: [https://multilingual-agent-ui.vercel.app](https://multilingual-agent-ui.vercel.app)
- **Backend API (Hugging Face)**: `https://musadiq7860-multilingual-support-agent.hf.space`

## Tech Stack

**Backend** 
- FastAPI + Python
- **Groq API (`llama-3.3-70b-versatile`)** for lightning-fast language detection, intent classification, sentiment analysis, and Roman Urdu/Hindi translation
- **n8n Webhook Integration** securely triggered via FastAPI Background Tasks for automated downstream routing
- Supabase (PostgreSQL database)
- JWT Authentication + bcrypt

**Frontend**
- React 18 + TypeScript + Vite (Deployed on Vercel)
- Framer Motion (animations)
- Custom Premium Glassmorphism UI Design System
- IBM Plex Mono + Bebas Neue + Outfit typography

## Features

- Submit complaints in any language
- Auto language detection and Roman Urdu translation
- Intent classification — billing, refund, complaint, technical, general
- Sentiment analysis — positive, neutral, negative
- Urgency scoring — high vs normal
- Auto-generated AI reply in customer's language using Groq
- Secure n8n webhook trigger for real-time ticket escalation
- Customer portal — submit and track tickets
- Admin dashboard — view all tickets, filter, mark resolved

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/` | No | System health and API key check |
| POST | `/register` | No | Create account |
| POST | `/login` | No | Get JWT token |
| POST | `/analyze` | Yes | Analyze message with Groq, save ticket, & trigger n8n |
| GET  | `/tickets/me`| Yes | Get authenticated user's tickets |
| GET  | `/tickets/all`| Yes | Get all system tickets (admin) |
| PUT  | `/tickets/{id}/status` | Yes | Update ticket status |

## Setup

**Backend Local Setup**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

**Frontend Local Setup**
```bash
cd frontend
npm install
npm run dev
```

**Required Environment Variables (`backend/.env`)**
```env
# AI Processing
GROQ_API_KEY=your_groq_api_key

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Authentication
JWT_SECRET=your_jwt_secret

# Downstream Integrations (n8n)
N8N_WEBHOOK_URL=https://your-n8n-domain/webhook/support-ticket
N8N_AUTH_SECRET=your_custom_webhook_secret
```

## Author
Built by [Mussadiq](https://github.com/musadiq7860)

# Multilingual Customer Support Agent

An AI-powered customer support triage system that understands complaints in any language — Urdu, Arabic, French, English, and more — and automatically classifies intent, sentiment, and urgency.

## Live Demo
- Frontend: [Coming soon]
- Backend API: [Coming soon]

## Tech Stack

**Backend**
- FastAPI + Python
- HuggingFace Inference API (language detection, intent classification, sentiment analysis)
- Google Translate (Roman Urdu / Hindi fallback)
- Supabase (PostgreSQL database)
- JWT Authentication + bcrypt

**Frontend**
- React 18 + TypeScript + Vite
- Framer Motion (animations)
- IBM Plex Mono + Bebas Neue (typography)
- Custom CSS design system

**AI Models**
- `papluca/xlm-roberta-base-language-detection` — detects 100+ languages
- `facebook/bart-large-mnli` — zero-shot intent classification
- `cardiffnlp/twitter-roberta-base-sentiment` — sentiment analysis
- `Helsinki-NLP/opus-mt` — multilingual translation

## Features

- Submit complaints in any language
- Auto language detection with confidence score
- Intent classification — billing, refund, complaint, technical, general
- Sentiment analysis — positive, neutral, negative
- Urgency scoring — high vs normal
- Auto-generated AI reply in customer's language
- Customer portal — submit and track tickets
- Admin dashboard — view all tickets, filter, mark resolved
- JWT-secured API endpoints

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | No | Create account |
| POST | /login | No | Get JWT token |
| POST | /analyze | Yes | Analyze message + create ticket |
| GET | /tickets/me | Yes | Get my tickets |
| GET | /tickets/all | Yes | Get all tickets (admin) |
| PUT | /tickets/{id}/status | Yes | Update ticket status |

## Setup

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Environment Variables**
```
HF_API_KEY=your_huggingface_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_secret
```

## Author
Built by [Mussadiq](https://github.com/musadiq7860) — 

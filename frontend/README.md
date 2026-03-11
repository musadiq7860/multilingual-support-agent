# Multilingual Support Agent — Frontend

This is the React 18 + Vite frontend for the Multilingual Customer Support Agent triage system. 
It provides a high-end interface for both end-users (submitting tickets) and admins (reviewing ticket analysis).

## Design System

The UI relies entirely on custom CSS (no generic component libraries) and features:
- **Animations:** Powered by `framer-motion`
- **Typography:** `Outfit` (headings/UI), `Bebas Neue` (display fonts), `IBM Plex Mono` (inputs/code)
- **Aesthetic:** Clean, dark-themed, data-heavy dashboard style with specific status badges (Open/Resolved/High Urgency).

## Deployment

This frontend is configured for deployment on **Vercel** and is currently live at:
[https://multilingual-agent-ui.vercel.app](https://multilingual-agent-ui.vercel.app)

The API client (`src/api/client.ts`) is currently pointing to the production Hugging Face Space backend:
`https://musadiq7860-multilingual-support-agent.hf.space`

## Local Development

```bash
# Install dependencies
npm install

# Start local dev server (default port 5173)
npm run dev
```

If testing against a local backend, temporarily modify the `baseURL` in `src/api/client.ts` to `http://127.0.0.1:8001`.

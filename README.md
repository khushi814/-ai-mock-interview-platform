# AI Mock Interview Platform

A full-stack platform where candidates practice job interviews through a real, dynamic **voice** conversation with an AI interviewer — not a fixed question list. The AI listens to what the candidate actually says, asks follow-up questions, adapts based on answer quality, and generates a detailed feedback report at the end.

## How it works

1. Candidate signs up and logs in (JWT-based auth)
2. Candidate picks an interview type: Behavioral, Technical, System Design, or HR / Culture Fit
3. A voice session starts — the AI interviewer (powered by [Vapi](https://vapi.ai)) introduces itself and conducts a fully dynamic conversation, asking follow-ups and probing weak answers in real time
4. When the interview ends, the full transcript is sent to the backend
5. Claude (Anthropic API) analyzes the transcript and generates a structured feedback report — overall score, strengths, areas to improve, and question-by-question notes
6. The candidate can view past sessions and reports from their dashboard

## Architecture

```
┌─────────────┐     REST API      ┌──────────────┐     SQL      ┌────────────┐
│   React     │ ────────────────► │   Express    │ ───────────► │ PostgreSQL │
│  (Vite)     │ ◄──────────────── │   Backend    │ ◄─────────── │            │
└─────────────┘                   └──────────────┘              └────────────┘
      │                                   ▲
      │  Vapi Web SDK                     │  webhook (end-of-call transcript)
      ▼                                   │
┌─────────────┐                   ┌──────────────┐
│  Vapi Voice │ ────────────────► │  Claude API  │
│  AI Agent   │   (via backend)   │  (feedback)  │
└─────────────┘                   └──────────────┘
```

- **Frontend** talks to the backend for auth and session management, and talks directly to Vapi for the real-time voice call (so audio never round-trips through our own server).
- **Vapi** runs the actual conversation — it has its own system prompt defining interviewer behavior per interview type, and its own model for real-time responses.
- When the call ends, Vapi sends the full transcript to our backend via webhook. The backend then calls **Claude** to turn that transcript into a structured feedback report and saves it to the database.

## Tech stack

| Layer               | Choice                                |
| ------------------- | ------------------------------------- |
| Frontend            | React (Vite)                          |
| Backend             | Node.js + Express                     |
| Database            | PostgreSQL                            |
| Auth                | JWT (email + password, bcrypt-hashed) |
| Voice AI            | Vapi (managed voice agent platform)   |
| Feedback generation | Claude API (Anthropic)                |

## Project structure

```
ai-mock-interview-platform/
├── backend/     → Express API, auth, sessions, feedback generation
└── frontend/    → React app (signup/login, interview UI, dashboard)
```

## Local setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, VAPI_API_KEY, VAPI_ASSISTANT_ID, VAPI_PUBLIC_KEY, ANTHROPIC_API_KEY
npm run db:setup
npm run dev
```

Backend runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000
npm run dev
```

Frontend runs on `http://localhost:5173`.

### Webhook (for feedback generation)

Vapi needs a public URL to send the end-of-call transcript to. For local development, expose your backend with a tool like [ngrok](https://ngrok.com):

```bash
ngrok http 5000
```

Then set the resulting URL (`<ngrok-url>/api/sessions/webhook`) as the Server URL in your Vapi assistant's settings.

## Cost notes

- **Vapi**: charged per minute of voice conversation (transcription + LLM + text-to-speech combined, roughly a few cents per minute depending on voice/model choice).
- **Claude API**: charged per feedback report generated, based on transcript length — a typical 10–15 minute interview transcript costs a fraction of a cent to a few cents per report.

## Known limitations / next steps

- Feedback report generation is implemented but pending a final end-to-end test with funded API credits.
- No dedicated session-detail view yet — past session scores are visible from the dashboard list.
- LangGraph-based conversation engine (bonus scope from the assignment) not yet implemented; the current conversation logic lives inside the Vapi assistant's system prompt.

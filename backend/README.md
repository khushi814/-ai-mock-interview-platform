# AI Mock Interview Platform — Backend Setup

## Step 1: Dependencies install karo
```bash
cd backend
npm install
```

## Step 2: PostgreSQL setup
- Apne system pe PostgreSQL install hona chahiye (agar nahi hai toh https://www.postgresql.org/download/ se le lo, ya phir free cloud DB use karo jaise [Neon](https://neon.tech) — signup free hai aur connection string mil jaati hai)
- Ek database banao: `mock_interview_db`

## Step 3: .env file banao
`.env.example` ko copy karke `.env` naam de do, aur apni values daalo:
```bash
cp .env.example .env
```
`DATABASE_URL` me apna Postgres connection string daalna, `JWT_SECRET` me koi bhi random string.

## Step 4: Tables banao
```bash
npm run db:setup
```
Isse `users` aur `interview_sessions` tables ban jayengi.

## Step 5: Server start karo
```bash
npm run dev
```
Browser/Postman me check karo: `http://localhost:5000/api/health`

## Test karo (Postman ya curl se)
**Signup:**
```
POST http://localhost:5000/api/auth/signup
Body: { "name": "Khushi", "email": "khushi@test.com", "password": "test123", "job_role": "Software Engineer", "experience_level": "fresher" }
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Body: { "email": "khushi@test.com", "password": "test123" }
```

Dono response me ek `token` milega — yehi JWT hai jo aage protected routes ke liye use hoga.

---
### Ab tak kya bana:
✅ Signup/Login with JWT
✅ Password hashing (bcrypt)
✅ Database schema (users + interview_sessions)

### Agla step:
- Frontend (React) — signup/login page
- Interview session route (voice AI integration shuru)

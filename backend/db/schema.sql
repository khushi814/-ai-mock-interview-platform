-- Database schema for AI Mock Interview Platform

-- Users table: signup/login ke liye
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    job_role VARCHAR(100),
    experience_level VARCHAR(50), -- e.g. 'fresher', '1-3 years', '3-5 years'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Interview sessions table: har interview ka record
CREATE TABLE IF NOT EXISTS interview_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    interview_type VARCHAR(50) NOT NULL, -- 'behavioral', 'technical', 'system_design', 'hr'
    status VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed'
    conversation_history JSONB DEFAULT '[]', -- pura conversation yahan store hoga (array of {role, content})
    feedback_report JSONB, -- final feedback yahan save hoga
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

-- Index for faster lookup of a user's sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON interview_sessions(user_id);

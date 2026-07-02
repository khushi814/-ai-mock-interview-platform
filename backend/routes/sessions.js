// routes/sessions.js
// Interview session ka poora lifecycle yahan handle hota hai:
// start -> (voice call Vapi pe hoti hai) -> webhook se transcript aati hai -> feedback banta hai

import express from 'express';
import pool from '../db/pool.js';
import { verifyToken } from '../middleware/auth.js';
import { generateFeedback } from '../services/feedbackGenerator.js';

const router = express.Router();

// ---- START A NEW INTERVIEW SESSION ----
// Candidate "Start Interview" dabata hai, ye route call hota hai
router.post('/start', verifyToken, async (req, res) => {
  const { interview_type } = req.body; // 'behavioral' | 'technical' | 'system_design' | 'hr'

  if (!interview_type) {
    return res.status(400).json({ error: 'Interview type is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO interview_sessions (user_id, interview_type, status)
       VALUES ($1, $2, 'in_progress') RETURNING id, interview_type, started_at`,
      [req.userId, interview_type]
    );

    const session = result.rows[0];

    // Frontend ko session id + Vapi assistant details bhej rahe hain
    // Frontend inhi se Vapi ka voice call start karega
    res.status(201).json({
      session_id: session.id,
      interview_type: session.interview_type,
      vapi_assistant_id: process.env.VAPI_ASSISTANT_ID,
      vapi_public_key: process.env.VAPI_PUBLIC_KEY,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong starting the session.' });
  }
});

// ---- WEBHOOK: Vapi call khatam hone pe yahan transcript bhejta hai ----
// Ye route Vapi khud call karega, isliye JWT verify nahi hoga yahan
router.post('/webhook', async (req, res) => {
  try {
    const message = req.body.message;

    // Vapi sirf 'end-of-call-report' event pe hi humein poori transcript deta hai
    if (!message || message.type !== 'end-of-call-report') {
      return res.status(200).json({ received: true }); // baaki events ignore
    }

    // session_id humne call metadata me pass kiya tha (start call ke time)
    const sessionId = message.call?.metadata?.session_id;
    const transcript = message.transcript || message.messages || [];

    if (!sessionId) {
      console.error('Webhook me session_id nahi mila');
      return res.status(200).json({ received: true });
    }

    // Session ka interview_type nikalo taaki feedback generator ko context mile
    const sessionResult = await pool.query(
      'SELECT interview_type FROM interview_sessions WHERE id = $1',
      [sessionId]
    );
    const interviewType = sessionResult.rows[0]?.interview_type || 'behavioral';

    // Claude se feedback generate karwao
    const feedback = await generateFeedback(transcript, interviewType);

    // Database update karo - conversation + feedback + status
    await pool.query(
      `UPDATE interview_sessions
       SET conversation_history = $1, feedback_report = $2, status = 'completed', ended_at = NOW()
       WHERE id = $3`,
      [JSON.stringify(transcript), JSON.stringify(feedback), sessionId]
    );

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(200).json({ received: true }); // Vapi ko 200 hi bhejna hai warna retry karega
  }
});

// ---- GET ALL SESSIONS FOR LOGGED-IN USER (dashboard ke liye) ----
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, interview_type, status, started_at, ended_at,
              feedback_report->>'overall_score' as score
       FROM interview_sessions
       WHERE user_id = $1
       ORDER BY started_at DESC`,
      [req.userId]
    );
    res.json({ sessions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong fetching sessions.' });
  }
});

// ---- GET SINGLE SESSION DETAIL (poori transcript + feedback) ----
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    res.json({ session: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong fetching the session.' });
  }
});

export default router;

// routes/auth.js
// Do endpoints: /signup aur /login

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';

const router = express.Router();

// ---- SIGNUP ----
router.post('/signup', async (req, res) => {
  const { name, email, password, job_role, experience_level } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Naam, email, aur password zaroori hain.' });
  }

  try {
    // Check karo ki email already exist toh nahi karta
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Is email se account already bana hua hai.' });
    }

    // Password ko hash karo - kabhi bhi plain password store nahi karte
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, job_role, experience_level)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email`,
      [name, email, passwordHash, job_role, experience_level]
    );

    const user = result.rows[0];

    // Signup ke turant baad login bhi kar do - token de do
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup me kuch gadbad ho gayi.' });
  }
});

// ---- LOGIN ----
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email aur password zaroori hain.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Email ya password galat hai.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email ya password galat hai.' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login me kuch gadbad ho gayi.' });
  }
});

export default router;

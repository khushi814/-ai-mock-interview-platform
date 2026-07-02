// server.js
// Ye main entry point hai - poora backend yahan se start hota hai

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes: /api/auth/signup, /api/auth/login
app.use('/api/auth', authRoutes);

// Health check - yeh check karne ke liye ki server chal raha hai
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server chal raha hai ✅' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server chal raha hai: http://localhost:${PORT}`);
});

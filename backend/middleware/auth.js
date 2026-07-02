// middleware/auth.js
// Ye middleware har protected route pe check karega ki valid JWT token hai ya nahi.
// Jaise ek gatekeeper - bina valid token ke andar nahi jaane dega.

import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']; // format: "Bearer <token>"

  if (!authHeader) {
    return res.status(401).json({ error: 'Token nahi mila. Login karo pehle.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // ab aage ke route me req.userId use kar sakte hain
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalid ya expire ho gaya.' });
  }
}

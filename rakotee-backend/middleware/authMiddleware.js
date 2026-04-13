const jwt = require('jsonwebtoken');
const cookie = require('cookie');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader) {
    token = authHeader.split(' ')[1] || '';
  }

  // Fallback to admin_token cookie so browser-based admin tools can auth
  // without exposing token in localStorage.
  if (!token && req.headers.cookie) {
    try {
      const parsed = cookie.parse(req.headers.cookie);
      token = parsed.admin_token || '';
    } catch {
      token = '';
    }
  }

  if (!token) return res.status(401).json({ message: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Add helmet, rate limiting, and CORS to all routes if not already present

module.exports = authMiddleware;
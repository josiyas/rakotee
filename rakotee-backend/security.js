// Express security best practices
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cors = require('cors');

function applySecurity(app) {
  // Set security HTTP headers
  app.use(helmet());

  // Limit repeated requests to public APIs
  app.use(
    rateLimit({
      windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    })
  );

  // Prevent NoSQL injection (Express 5+ compatible)
  app.use(mongoSanitize({ replaceWith: '_' }));

  // CORS
  const corsOptions = {
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
  };
  app.use(cors(corsOptions));
}

// Use SESSION_SECRET for any session/cookie-based auth (if implemented)

module.exports = applySecurity;

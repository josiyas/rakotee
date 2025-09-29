require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const applySecurity = require('./security');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookie = require('cookie');

const app = express();

// Middleware
app.use(express.json());
applySecurity(app);

// Trust proxy for secure cookies and HTTPS (if behind a proxy like Heroku/Vercel)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}
// Enforce HTTPS in production
if (process.env.FORCE_HTTPS === 'true') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}
// CORS setup
const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
};
app.use(cors(corsOptions));
// Secure cookies
app.use((req, res, next) => {
  res.cookie = (...args) => {
    args[1] = args[1] || '';
    args[2] = args[2] || {};
    args[2].secure = process.env.COOKIE_SECURE === 'true';
    return cookie.serialize(...args);
  };
  next();
});
// Content Security Policy (CSP)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: [process.env.CSP_DEFAULT_SRC || "'self'"],
    scriptSrc: (process.env.CSP_SCRIPT_SRC || "'self'").split(' ')
  }
}));
// Rate limiting
app.use(rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100
}));
// Logging level
app.use(morgan(process.env.LOG_LEVEL || 'dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/order', require('./routes/orders'));

const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);

// Health check
app.get('/health', (req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  res.json({ status: 'ok', mongo: mongoReady ? 'connected' : 'disconnected' });
});

// Debug endpoints (one-off admin tests like sending an SMTP test email)
app.use('/api/debug', require('./routes/debug'));

// Protect admin order routes

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  serverApi: '1',
})
  .then(() => console.log('MongoDB connected securely'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

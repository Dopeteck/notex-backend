const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');
require('dotenv').config();
const { authenticateUser } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8080;

// Remove this line - Railway provides DATABASE_URL automatically
// const DATABASE_URL = process.env.DATABASE_URL;

// Middleware (ORDER MATTERS!)
app.use(helmet());
app.use(cors({
  origin: [
    'https://notex-app.web.app',
    'https://notex-7f567.web.app',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.raw({ type: 'application/json', limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Root route (ONCE!)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'NoteX API',
    timestamp: new Date().toISOString()
  });
});

// Health checks (NO rate limiting)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health-check', async (req, res) => {
  try {
    const dbResult = await db.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: dbResult.rows[0].now,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
});

// Apply rate limiter to API routes (after health checks)
app.use('/api/', limiter);

// Static files
const path = require('path');
app.use('/files', express.static(path.join(process.env.FILES_DIR || '/data/files')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/users', require('./routes/users'));
app.use('/webhooks', require('./routes/webhooks'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/gamification', require('./routes/gamification'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NoteX API running on port ${PORT}`);
});

module.exports = app;
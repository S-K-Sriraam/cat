require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ─── CORS ───
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ─── MIDDLEWARE ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── STATIC FRONTEND ───
// Serve built frontend from /public folder (for production single-server deploy)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ─── API ROUTES ───
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/tasks',    require('./routes/tasks'));
app.use('/api/mocks',    require('./routes/mocks'));
app.use('/api/progress', require('./routes/progress'));

// ─── HEALTH CHECK ───
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ─── CATCH-ALL: serve frontend for any non-API route ───
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found.' });
  }
});

// ─── ERROR HANDLER ───
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── MONGODB CONNECTION ───
const defaultMongoURI = 'mongodb://localhost:27017/cat_prep_db';
const envMongoURI = process.env.MONGODB_URI;
const invalidAtlasPlaceholder = envMongoURI && /<(username|password)>|cluster0\.xxxxx|\.mongodb\.net/.test(envMongoURI);
const MONGODB_URI = envMongoURI && !invalidAtlasPlaceholder ? envMongoURI : defaultMongoURI;

if (!envMongoURI) {
  console.warn('⚠️  MONGODB_URI is not set. Falling back to local MongoDB.');
} else if (invalidAtlasPlaceholder) {
  console.warn('⚠️  MONGODB_URI contains placeholder values. Falling back to local MongoDB.');
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 CAT Prep Tracker server running on port ${PORT}`);
      console.log(`   API:      http://localhost:${PORT}/api`);
      console.log(`   Frontend: http://localhost:${PORT}`);
      console.log(`   Health:   http://localhost:${PORT}/api/health`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

module.exports = app;

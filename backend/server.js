const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');

require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production.');
  }
  process.env.JWT_SECRET = 'local-dev-only-change-this-jwt-secret';
  console.warn('JWT_SECRET is not set. Using a development-only fallback secret.');
}

const app = express();

// ─── CORS ───
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.GITHUB_PAGES_URL,
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://s-k-sriraam.github.io'
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    // allow explicit origins
    if (allowedOrigins.includes(origin)) return cb(null, true);
    // allow GitHub Pages origins (e.g. https://username.github.io)
    try {
      const host = new URL(origin).hostname;
      if (host && host.endsWith('.github.io')) return cb(null, true);
    } catch (e) {
      // ignore URL parse errors
    }
    // allow if FRONTEND_URL env matches
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ─── MIDDLEWARE ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── STATIC FRONTEND ───
// Prefer serving the built React app from /frontend/dist if available.
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const frontendPublicPath = path.join(__dirname, '../frontend/public');
const frontendStaticPath = fs.existsSync(frontendDistPath) ? frontendDistPath : frontendPublicPath;

app.use(express.static(frontendStaticPath));

// ─── API ROUTES ───
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/tasks',    require('./routes/tasks'));
app.use('/api/mocks',    require('./routes/mocks'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/ai',       require('./routes/ai'));

// ─── HEALTH CHECK ───
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    service: 'cat-prep-tracker-api',
    routes: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/health'
    ]
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found.',
    method: req.method,
    path: req.originalUrl,
    availableAuthRoutes: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me'
    ]
  });
});

// ─── CATCH-ALL: serve frontend for any non-API route ───
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendStaticPath, 'index.html'));
  } else {
    res.status(404).json({
      error: 'API endpoint not found.',
      method: req.method,
      path: req.originalUrl,
      availableAuthRoutes: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/me'
      ]
    });
  }
});

// ─── ERROR HANDLER ───
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── MONGODB CONNECTION ───
const defaultMongoURI = 'mongodb://localhost:27017/cat_prep_db';
const getEnv = (...keys) => {
  for (const key of keys) {
    const value = process.env[key] && process.env[key].trim();
    if (value) return value;
  }
  return '';
};

const atlasUser = getEnv('MONGODB_USER', 'MONGODB_USERNAME', 'MONGO_USER', 'MONGO_USERNAME', 'DB_USER');
const atlasPassword = getEnv('MONGODB_PASSWORD', 'MONGO_PASSWORD', 'DB_PASSWORD');
const atlasHost = getEnv('MONGODB_HOST', 'MONGO_HOST', 'ATLAS_CLUSTER_HOST') || 'cluster0.hibhiqq.mongodb.net';
const atlasDatabase = getEnv('MONGODB_DATABASE', 'MONGO_DATABASE', 'DB_NAME') || 'cat_prep_db';
const atlasAppName = getEnv('MONGODB_APP_NAME', 'MONGO_APP_NAME') || 'Cluster0';

function buildAtlasURIFromParts() {
  if (!atlasUser || !atlasPassword) return '';

  const username = encodeURIComponent(atlasUser);
  const password = encodeURIComponent(atlasPassword);
  const database = encodeURIComponent(atlasDatabase);
  const appName = encodeURIComponent(atlasAppName);

  return `mongodb+srv://${username}:${password}@${atlasHost}/${database}?retryWrites=true&w=majority&appName=${appName}`;
}

function isInvalidMongoURI(uri) {
  if (!uri) return true;

  try {
    const parsed = new URL(uri);
    const protocolIsValid = parsed.protocol === 'mongodb:' || parsed.protocol === 'mongodb+srv:';
    const hostname = parsed.hostname.toLowerCase();

    return (
      !protocolIsValid ||
      uri.includes('<username>') ||
      uri.includes('<password>') ||
      hostname === 'cluster.mongodb.net' ||
      hostname === 'cluster0.xxxxx.mongodb.net' ||
      hostname.endsWith('.xxxxx.mongodb.net')
    );
  } catch (err) {
    return true;
  }
}

const rawMongoURI = getEnv('MONGODB_URI');
const generatedMongoURI = buildAtlasURIFromParts();
const envMongoURI = rawMongoURI && !isInvalidMongoURI(rawMongoURI)
  ? rawMongoURI
  : generatedMongoURI || rawMongoURI;
const invalidMongoURI = isInvalidMongoURI(envMongoURI);

console.log('MongoDB config:', {
  hasMongodbUri: Boolean(rawMongoURI),
  hasMongodbUser: Boolean(atlasUser),
  hasMongodbPassword: Boolean(atlasPassword),
  mongodbHost: atlasHost,
  mongodbDatabase: atlasDatabase,
  usingGeneratedAtlasUri: Boolean(generatedMongoURI && (!rawMongoURI || isInvalidMongoURI(rawMongoURI)))
});

if (process.env.NODE_ENV === 'production' && invalidMongoURI) {
  throw new Error(
    'Set MONGODB_URI in Render to your full Atlas URI, or set MONGODB_USER and MONGODB_PASSWORD. The Atlas host must be cluster0.hibhiqq.mongodb.net.'
  );
}

const MONGODB_URI = !invalidMongoURI ? envMongoURI : defaultMongoURI;

if (!envMongoURI) {
  console.warn('⚠️  MONGODB_URI is not set. Falling back to local MongoDB.');
} else if (invalidMongoURI) {
  console.warn('⚠️  MONGODB_URI is invalid or contains placeholder values. Falling back to local MongoDB.');
}

async function startServer(uri) {
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);

    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Falling back to in-memory MongoDB for local development.');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log('✅ In-memory MongoDB started successfully');
    } else {
      process.exit(1);
    }
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 CAT Prep Tracker server running on port ${PORT}`);
    console.log(`   API:      http://localhost:${PORT}/api`);
    console.log(`   Frontend: http://localhost:${PORT}`);
    console.log(`   Health:   http://localhost:${PORT}/api/health`);
  });
}

startServer(MONGODB_URI).catch(err => {
  console.error('Startup failed:', err);
  process.exit(1);
});

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

module.exports = app;

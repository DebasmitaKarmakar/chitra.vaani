const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./db');

// ✅ ADD: Import security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');

// Import routes
const artworkRoutes = require('./routes/artworks');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const feedbackRoutes = require('./routes/feedback'); // ✅ ADD THIS

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ ADD: Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "https://res.cloudinary.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://chitravaani-api.vercel.app"],
      frameSrc: ["'self'", "https://accounts.google.com"],
    },
  },
}));

// ✅ IMPROVED: Better CORS configuration
const allowedOrigins = [
  'https://chitravaani.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ ADD: Request size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ ADD: XSS Protection
app.use(xss());

// ✅ ADD: HTTP Parameter Pollution protection
app.use(hpp());

// ✅ ADD: Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ✅ ADD: Disable X-Powered-By
app.disable('x-powered-by');

// ✅ IMPROVED: Request logging with IP
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ChitraVaani API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/artworks', artworkRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes); // ✅ ADD THIS LINE

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ChitraVaani API',
    version: '1.0.0',
    endpoints: {
      artworks: '/api/artworks',
      orders: '/api/orders',
      categories: '/api/categories',
      admin: '/api/admin',
      feedback: '/api/feedback', // ✅ ADD THIS LINE
      health: '/api/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});
// ✅ IMPROVED: Better error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  // Handle specific error types
  if (err.name === 'MulterError') {
    return res.status(400).json({ 
      error: 'File upload error', 
      message: err.message 
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy violation',
      message: 'Origin not allowed'
    });
  }

  // Hide error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { 
      stack: err.stack,
      details: err 
    })
  });
});

// ✅ IMPROVED: Better startup with security info
async function startServer() {
  try {
    // ✅ ADD: Validate JWT_SECRET
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 64) {
      console.warn('⚠️  WARNING: JWT_SECRET is too short! Should be 64+ characters.');
    }

    await initDatabase();
    
    app.listen(PORT, () => {
      console.log('=================================');
      console.log('🛡️  ChitraVaani Secure API');
      console.log('=================================');
      console.log(`✅ Server: http://localhost:${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Database: Connected`);
      console.log(`✅ Security: Enabled`);
      console.log('   - Helmet (CSP, HSTS, XSS)');
      console.log('   - Rate Limiting (100 req/15min)');
      console.log('   - CORS Protection');
      console.log('   - Input Sanitization');
      console.log('=================================');
      console.log(`📡 Health: http://localhost:${PORT}/api/health`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Closing server gracefully...');
  process.exit(0);
});

startServer();

module.exports = app;
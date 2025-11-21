const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./db');

// Import routes
const artworkRoutes = require('./routes/artworks');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const feedbackRoutes = require('./routes/feedback');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
//  CORS Configuration
const allowedOrigins = [
  'https://chitravaani.vercel.app',     // frontend prod
  'https://chitravaani.vercel.app/*',   // optional
  'https://*.vercel.app',               // ALL your preview builds
  'http://localhost:5173'               // local dev
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o.replace('*', '')))) {
      callback(null, true);
    } else {
      console.log(" CORS blocked:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
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
app.use('/api/feedback', feedbackRoutes);

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'MulterError') {
    return res.status(400).json({ 
      error: 'File upload error', 
      message: err.message 
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const { testEmailConnection } = require('./emailService');

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database tables
    await initDatabase();
    
    // Test email connection
    await testEmailConnection();
    
    // Start server
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(' ChitraVaani API Server');
      console.log('=================================');
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` API URL: http://localhost:${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log('=================================');
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
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

// Start the server
startServer();

module.exports = app;
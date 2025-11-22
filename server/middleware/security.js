
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const xss = require('xss-clean');
const hpp = require('hpp');

// 1. HELMET - Security Headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "https://res.cloudinary.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://chitravaani-api.vercel.app"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
});

// 2. RATE LIMITING - Prevent Brute Force & DoS
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true
});

const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 feedback submissions per hour
  message: 'Too many feedback submissions. Please try again later.'
});

const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 orders per hour
  message: 'Too many orders. Please try again later.'
});

// 3. INPUT VALIDATION RULES
const feedbackValidation = [
  body('customer_name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters'),
  
  body('customer_email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .isLength({ max: 255 }),
  
  body('feedback_type')
    .notEmpty().withMessage('Feedback type is required')
    .isIn(['artwork_quality', 'customer_service', 'website_experience', 'delivery', 'pricing', 'suggestion', 'complaint', 'appreciation', 'other'])
    .withMessage('Invalid feedback type'),
  
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters')
    .escape() // Prevent XSS
];

const orderValidation = [
  body('customer_name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .escape(),
  
  body('customer_email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email')
    .normalizeEmail(),
  
  body('customer_phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number'),
  
  body('order_type')
    .notEmpty()
    .isIn(['regular', 'custom', 'bulk']).withMessage('Invalid order type')
];

// 4. VALIDATION ERROR HANDLER
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array().map(e => ({ field: e.param, message: e.msg }))
    });
  }
  next();
};

// 5. SQL INJECTION PREVENTION
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // Remove potential SQL injection patterns
    return input.replace(/['";\\]/g, '');
  }
  return input;
};

// 6. HTTPS ENFORCEMENT MIDDLEWARE
const enforceHTTPS = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
  }
  next();
};

// 7. SECURE JWT VERIFICATION
const jwt = require('jsonwebtoken');
const secureVerifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Explicitly specify algorithm
      maxAge: '7d' // Token expiry
    });

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ error: 'Token expired' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Token verification failed' });
  }
};

// 8. PASSWORD VALIDATION
const validatePassword = (password) => {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 12 characters' };
  }
  if (!hasUpperCase) {
    return { valid: false, message: 'Password must contain uppercase letters' };
  }
  if (!hasLowerCase) {
    return { valid: false, message: 'Password must contain lowercase letters' };
  }
  if (!hasNumbers) {
    return { valid: false, message: 'Password must contain numbers' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain special characters' };
  }

  return { valid: true };
};

// 9. CORS CONFIGURATION
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://chitravaani.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

// 10. REQUEST SIZE LIMITS
const requestSizeLimits = {
  json: { limit: '10mb' },
  urlencoded: { limit: '10mb', extended: true }
};

// 11. AUDIT LOGGING
const auditLog = async (action, userId, details, promisePool) => {
  try {
    await promisePool.query(
      `INSERT INTO audit_log (user_id, action, details, ip_address, timestamp) 
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, action, JSON.stringify(details), details.ip]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

module.exports = {
  helmetConfig,
  generalLimiter,
  authLimiter,
  feedbackLimiter,
  orderLimiter,
  feedbackValidation,
  orderValidation,
  handleValidationErrors,
  sanitizeInput,
  enforceHTTPS,
  secureVerifyToken,
  validatePassword,
  corsOptions,
  requestSizeLimits,
  xss,
  hpp,
  auditLog
};
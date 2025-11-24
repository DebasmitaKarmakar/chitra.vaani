const jwt = require('jsonwebtoken');

// Verify JWT token middleware
function verifyToken(req, res, next) {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired. Please login again.' 
      });
    }
    res.status(403).json({ 
      error: 'Invalid or malformed token.' 
    });
  }
}

// Verify admin role middleware
function verifyAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Authentication required.' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Forbidden: Admin access only.' 
    });
  }

  next();
}

// Combined middleware: verify token + admin role
function requireAdmin(req, res, next) {
  verifyToken(req, res, (err) => {
    if (err) return;
    verifyAdmin(req, res, next);
  });
}

module.exports = {
  verifyToken,
  verifyAdmin,
  requireAdmin
};
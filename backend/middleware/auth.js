const { userService } = require('../services/firebaseService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Simple token storage (in production, use Redis or database)
const tokenBlacklist = new Set();

/**
 * Verify JWT token middleware
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token không hợp lệ hoặc không được cung cấp' });
    }

    const token = authHeader.split(' ')[1];
    
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ error: 'Token đã hết hạn' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edumentor-secret-key');
    
    // Add user info to request
    req.user = decoded;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token đã hết hạn' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token không hợp lệ' });
    }
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Lỗi xác thực' });
  }
};

/**
 * Generate JWT token
 */
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'edumentor-secret-key',
    { expiresIn: '7d' }
  );
};

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Blacklist token (for logout)
 */
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

module.exports = {
  verifyToken,
  generateToken,
  hashPassword,
  comparePassword,
  blacklistToken
};

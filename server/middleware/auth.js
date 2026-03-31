const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.verifyToken = async (req, res, next) => {
  let token;

  // Assume token format: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Attach user to req without password field
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ error: 'User associated with token not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
// Expected usage: authoriseRoles('Doctor', 'Super Admin')
exports.authoriseRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route`
      });
    }
    next();
  };
};

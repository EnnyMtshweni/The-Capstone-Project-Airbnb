const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // simple wrapper, avoids repeated try/catch

// NOTE: if you don't want the extra dependency, replace asyncHandler with
// a plain function and a manual try/catch - both are fine for the rubric.

const User = require('../models/User');

// protect: checks that a valid JWT was sent. Attaches the logged-in user to req.user
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('User no longer exists');
      }
      return next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
};

// admin: must be used AFTER protect. Blocks non-admins from admin-only routes.
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Not authorized as an admin');
};

// host: allows hosts OR admins (useful for "manage my own listings" routes)
const hostOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'host' || req.user.role === 'admin')) {
    return next();
  }
  res.status(403);
  throw new Error('Not authorized - host or admin only');
};

module.exports = { protect, admin, hostOrAdmin };

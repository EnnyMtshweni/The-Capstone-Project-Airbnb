const jwt = require('jsonwebtoken');

// Creates a signed JWT containing the user's id and role.
// Used right after register/login so the frontend can store it and
// send it back as "Authorization: Bearer <token>" on future requests.
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;

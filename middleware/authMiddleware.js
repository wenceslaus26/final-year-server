const jwt = require('jsonwebtoken');
const secretKey = require('../jwt-token');
const User = require('../models/user-model');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ errorMessage: 'Unauthorized' });
  }

  jwt.verify(token, secretKey, async (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ errorMessage: 'Invalid token' });
    }

    try {
      const user = await User.findOne({ email: decodedToken.email });

      if (!user) {
        return res.status(404).json({ errorMessage: 'User not found' });
      }

      req.user = {
        _id: user._userId,
        email: user.email
      };

      next();
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ errorMessage: 'Internal server error' });
    }
  });
};

module.exports = authenticateToken;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user-model');
const secretKey = require('../jwt-token');


class AuthResponseData {
  constructor(user) {
      this.user = user;
  }
}

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    // Extract user data from request body
    const { email, password } = req.body;
  
    // Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ errorMessage: 'Invalid email' });
    };
  
    const hashedPasswordFromDb = user.password;
  
    const salt = user.salt;
    const hashedUserPassword = await bcrypt.hash(password, salt);
  
    console.log(hashedUserPassword);
    console.log(hashedPasswordFromDb);
              
    // Compare passwords
    if (hashedUserPassword === hashedPasswordFromDb){
  
      // Generate a JSON Web Token (JWT)
      const token = jwt.sign({ email: user.email }, secretKey);
  
      // Set token expiration date (e.g., 1 hour from now)
      const expirationDate = new Date().getTime() + 7200000;
    
      // Create a new user instance
      const loggedInUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        id: user._id,
        _token: token,
        _tokenExpirationDate: expirationDate,
      };
    
      // Return the authentication response with user details
      const authResponse = new AuthResponseData(loggedInUser);
    
      res.status(200).json(authResponse);
    }
    else {
      res.status(401).json({ errorMessage: 'Invalid email or password' });
    }
  } 
  catch (error) {
    console.error('Error:', error);
    console.error('Stack trace:', error.stack);
  
    res.status(500).json({ errorMessage: 'Internal server error' });
  }
}); 


module.exports = router;
const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/user-model');
const secretKey = require('../jwt-token');

class AuthResponseData {
  constructor(user) {
    this.user = user;
  }
}
  
// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    // Extract user data from request body
    const { 
      firstName, 
      lastName, 
      email, 
      role,
      password } = req.body;
  
    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errorMessage: 'Email already exists' });
    }
    
    const userId = uuidv4();

    // Set a default password if the provided password is empty
    let plainTextPassword = password;
    if (!plainTextPassword) {
      plainTextPassword = 'defaultPassword123';
    }
  
    // Generate a salt asynchronously
    bcryptjs.genSalt(10, (saltError, salt) => {
    console.log(salt);
    if (saltError) {
      console.error('Error generating salt:', saltError);
      return res.status(500).json({ errorMessage: 'Internal server error' });
    }
  
    // Hash the password asynchronously
    bcryptjs.hash(plainTextPassword, salt, async (hashError, hashedPassword) => {
      console.log(salt);
      if (hashError) {
        console.error('Error hashing password:', hashError);
        return res.status(500).json({ errorMessage: 'Internal server error' });
      }
  
      try {
        // Create a new user object
        const newUser = new User({
          _userId: userId,
          firstName,
          lastName,
          email,
          role,
          password: hashedPassword,
          salt: salt
        });
  
        // Save the user to the database
        await newUser.save();
  
        // Generate a JSON Web Token (JWT)
        const token = jwt.sign({ email: newUser.email }, secretKey);
  
        // Set token expiration date (e.g., 1 hour from now)
        const expirationDate = new Date().getTime() + 7200000;
  
        // Create a new user instance
        const user = {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          id: newUser._id,
          _token: token,
          _tokenExpirationDate: expirationDate,
        };
  
        // Return the authentication response with user details
        const authResponse = new AuthResponseData(user);
  
        res.status(201).json(authResponse);
      } catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: 'Internal server error' });
        }
      });
    });
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
  //console.log(req.body)
});


module.exports = router;
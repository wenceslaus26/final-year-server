const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
//const { RegExp } = require('regexp');

const User = require('../models/user-model');
const authenticateToken = require('../middleware/authMiddleware')

// GET user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;

    const user = await User.findOne({email: email}).select('firstName lastName email role');
    
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    
    res.json(user);
  } 
  catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update user profile
router.put('/profile/update', authenticateToken, (req, res) => {
  const updatedProfile = req.body;
  const userEmail = req.user.email;
  
  User.findOneAndUpdate(
    { email: userEmail },
    { $set: { 
        firstName: updatedProfile.firstName, 
        lastName: updatedProfile.lastName, 
        email: updatedProfile.email} },
    { new: true }
  )
  .then((updatedUser) => {
    // Return the updated user profile as the response
    res.json(updatedUser);
  })
  .catch((error) => {
    console.error('Error updating user profile:', error);
    // Handle the error and send an appropriate response
    res.status(500).json({ error: 'Failed to update user profile' });
  });
});
  


module.exports = router;
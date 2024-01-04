const express = require('express');
const router = express.Router();

const User = require('../models/user-model');
const authenticateToken = require('../middleware/authMiddleware');
const userController = require('../controllers/usersController');

// get user emails
router.get('/emails', authenticateToken, async (req, res) => {
  try {
    const currentUserEmail = req.user.email;

    // Find the user by email and populate the chats field
    const user = await User.findOne({ email: currentUserEmail })

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const emails = [user.email];

    res.status(200).json(emails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ errorMessage: 'Internal server error' });
  }
});

// get user info
router.get('/', userController.getUser);

// Get user ID by email
router.get('/id/:email', async (req, res) => {
  const { email } = req.params;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ userId: user._id });
  } catch (error) {
    console.error('Error retrieving user ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update User Presence
router.post('/:userId/presence', async (req, res) => {
  try {
    const { userId } = req.params;
    const { online } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { online },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, online });
  } catch (error) {
    console.error('Error updating user presence:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
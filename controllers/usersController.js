const User = require('../models/user-model');

const getUser = async (req, res) => {
  const { email } = req.query;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUser
};

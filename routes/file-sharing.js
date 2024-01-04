const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mime = require('mime');

const User = require('../models/user-model');
const File = require('../models/file-model');
const authenticationToken = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const filename = file.originalname; 
    cb(null, filename);
  }
});

const upload = multer({ storage });

router.post('/upload', authenticationToken, upload.single('file'), async (req, res) => {
  try {
    const { recipientEmail, description } = req.body;
    const senderEmail = req.user.email;

    // Find recipient and sender in the database
    const recipient = await User.findOne({ email: recipientEmail });
    const sender = await User.findOne({ email: senderEmail });

    if (!recipient || !sender) {
      return res.status(404).json({ message: 'Recipient or sender not found' });
    }

    // Create a new document in the database
    const newFile = new File({
      sender: sender._id,
      recipient: recipient._id,
      description,
      filePath: req.file.path
    });

    // Save the file
    await newFile.save();

    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Endpoint for retrieving files sent to a user
router.get('/fetch', authenticationToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    console.log(userEmail);

    // Find the user in the database
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find files sent to the user and populate the sender and recipient fields
    const files = await File.find({ recipient: user._id })
      .populate('sender', 'email')
      .populate('recipient', 'email');

    // Map the files to include only the email addresses of sender and recipient
    const filesWithEmails = files.map((file) => ({
      _id: file._id,
      sender: file.sender.email,
      recipient: file.recipient.email,
      description: file.description,
    }));

    res.status(200).json(filesWithEmails);
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).json({ message: 'Error retrieving files' });
  }
});

// Endpoint for retrieving files sent to a user
router.get('/fetch/:fileId', authenticationToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const fileId = req.params.fileId;

    // Find the user in the database
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the file sent to the user
    const file = await File.findOne({ _id: fileId, recipient: user._id });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Get the file path
    const filePath = file.filePath;

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set the response headers
    const fileExtension = path.extname(filePath);
    const fileName = fileExtension;

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.log('Error downloading file:', err);
      } else {
        console.log('File downloaded successfully');
      }
    });    
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ message: 'Error retrieving file' });
  }
});

module.exports = router;
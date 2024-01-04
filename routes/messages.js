const express = require('express');

const Message = require('../models/messages-model');
const Chat = require('../models/chat-model');
const User = require('../models/user-model');

const messageController = require('../controllers/messagesController')

const router = express.Router();

router.post('/send', async (req, res) => {
  try {
    const { senderEmail, recipientEmail, content } = req.body;

    const savedMessage = messageController.sendMessage({ senderEmail, recipientEmail, content });
    
    console.log(savedMessage);
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});    

router.get('/fetch', async (req, res) => {
    try {
      const { sender, recipient } = req.query;
  
      const senderUser = await User.findOne({ email: sender });
      const recipientUser = await User.findOne({ email: recipient });
  
      if (!senderUser || !recipientUser) {
        return res.status(404).json({ message: 'Sender or recipient not found' });
      }
  
      const messages = await Message.find({
        $or: [
          { sender: senderUser._id, recipient: recipientUser._id },
          { sender: recipientUser._id, recipient: senderUser._id },
        ],
      }).sort({ createdAt: 'asc' });
  
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
  
router.get('/chats', async (req, res) => {
  try {
    const { userId } = req.query;

    const chats = await Chat.find({
      $or: [{ sender: userId }, { recipient: userId }],
    }).populate('messages');

    const populatedChats = await populateChatsWithUsers(chats);

    res.json(populatedChats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function populateChatsWithUsers(chats) {
  const chatPromises = chats.map(async (chat) => {
    const sender = await User.findOne({ _id: chat.sender });
    const recipient = await User.findOne({ _id: chat.recipient });

    return {
      _id: chat._id,
      sender: sender.email,
      recipient: recipient.email,
      messages: chat.messages,
    };
  });

  return Promise.all(chatPromises);
} 

module.exports = router;

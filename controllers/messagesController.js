const Message = require('../models/messages-model');
const Chat = require('../models/chat-model');
const User = require('../models/user-model');

async function sendMessage(message, senderSocket) {
    try {
      const { senderEmail, recipientEmail, content } = message;
  
      const sender = await User.findOne({ email: senderEmail });
      if (!sender) {
        return;
      }
  
      const recipient = await User.findOne({ email: recipientEmail });
      if (!recipient) {
        return;
      }
  
      let chat = await Chat.findOne({
        $or: [
          { sender: sender._id, recipient: recipient._id },
          { sender: recipient._id, recipient: sender._id }
        ]
      });
  
      if (!chat) {
        chat = new Chat({
          sender: sender._id,
          recipient: recipient._id,
          messages: [],
        });
        await chat.save();
      }
  
      const newMessage = new Message({
        sender: sender._id,
        recipient: recipient._id,
        content,
        chatId: chat._id,
      });

      console.log(newMessage);
  
      const savedMessage = await newMessage.save();

      console.log(savedMessage);
  
      // Update the chat's messages array
      chat.messages.push(savedMessage._id);
      await chat.save();
  
      // Emit the saved message to the sender
      senderSocket.emit('message', savedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
}

module.exports = {
    sendMessage
};
const mongoose = require('mongoose');
const User = require('./user-model');
const Chat = require('./chat-model')

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: Chat, required: true }
}, 
{
  collection: 'messages'
});

module.exports = mongoose.model('Message', messageSchema);

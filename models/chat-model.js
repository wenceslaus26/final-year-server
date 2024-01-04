const mongoose = require('mongoose');
const User = require('./user-model');

const chatSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
},
{
  collection: 'chats'
});

module.exports = mongoose.model('Chat', chatSchema);

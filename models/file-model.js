const mongoose = require('mongoose');

const User = require('./user-model')

const fileSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  }
},
{
    collection: 'files'
});

const File = mongoose.model('File', fileSchema);

module.exports = File;

const mongoose = require('mongoose');

const Stages = require('./stages-model')

const taskSchema = new mongoose.Schema({  
  taskName: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  stage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Stages
  }
}, 
{
  collection: 'tasks'
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

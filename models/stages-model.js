const mongoose = require('mongoose');

const Project = require('./project-model')

const stageSchema = new mongoose.Schema({
  stageId: {
    type: String,
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Project,
    required: true
  },
  stageName: {
    type: String,
    required: true
  },
  stageDescription: {
    type: String,
    required: true
  },
  stageOwner: {
    type: String,
    required: true
  },
  stageTasks: [
    {
      taskName: {
        type: String,
        required: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  stageStatus: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  }
}, 
{
    collection: 'stages'
});

module.exports = mongoose.model('Stage', stageSchema);

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  projectDescription: {
    type: String,
    required: true
  },
  projectOwner: {
    type: String,
    required: true
  },
  projectStages: [
    {
      stageId: {
        type: String,
        required: true
      },
      stageName: {
        type: String,
        required: true,
      },
      stageStatus: {
        type: String,
        required: true,
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
  projectStatus: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  }
}, 
{
    collection: 'projects'
});

module.exports = mongoose.model('Project', projectSchema);

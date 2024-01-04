const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

const Project = require('../models/project-model');
const Stage = require('../models/stages-model');
const Task = require('../models/task-model');

router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
  
    // Assuming you have a Mongoose model named 'Project'
    const projects = await Project.find({ projectOwner: userEmail }, 'projectName startDate endDate');
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/stages', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
  
    // Assuming you have a Mongoose model named 'Stage'
    const stages = await Stage.find({ stageOwner: userEmail }, 'stageName startDate endDate');
    res.json(stages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
  
    // Assuming you have a Mongoose model named 'Stage'
    const stages = await Stage.find({ stageOwner: userEmail }, 'stageTasks');
  
    const tasks = stages.flatMap((stage) => {
      return stage.stageTasks.map((task) => {
        return {
          taskName: task.taskName,
          startDate: stage.startDate,
          endDate: stage.endDate
        };
      });
    });
  
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

  
  
module.exports = router;
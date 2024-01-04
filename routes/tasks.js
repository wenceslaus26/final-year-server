const express = require('express');
const router = express.Router();

const Task = require('../models/task-model');
const Stage = require('../models/stages-model');
const authenticateToken = require('../middleware/authMiddleware');


router.post('/tasks/create', async (req, res) => {
  try {
    const { stageId, taskName, completed } = req.body;

    const stage = await Stage.findOne({ stageId });

    if (!stage) {
      return res.status(404).json({ error: 'Stage not found' });
    }

    const newTask = {
      taskName,
      completed
    };

    stage.stageTasks.push(newTask);

    const savedStage = await stage.save();

    res.status(201).json(savedStage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    const tasks = await Stage.find({ stageOwner: email }).select('stageTasks');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

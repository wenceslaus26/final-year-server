const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const Stage = require('../models/stages-model');
const Project = require('../models/project-model');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/create', async (req, res) => {
  try {
    const userEmail = req.body.stageOwner;

    const project = await Project.findOne({ projectOwner: userEmail });

    if (!project) {
      return res.status(404).json({ error: 'Project not found for the user' });
    }

    const stageID = uuidv4();
    
    const stage = new Stage({
      stageId: stageID,
      projectId: project._id,
      stageName: req.body.stageName,
      stageDescription: req.body.stageDescription,
      stageOwner: req.body.stageOwner,
      stageTasks: req.body.stageTasks,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      stageStatus: req.body.stageStatus
    });

    const savedStage = await stage.save();

    // Update the stageId with the generated _id value
    savedStage.stageId = savedStage._id.toString();
    await savedStage.save();

    res.status(201).json(savedStage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/fetch', authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    const stages = await Stage.find({ stageOwner: email });
    const modifiedStages = stages.map((stage) => ({
      ...stage.toObject(),
      stageId: stage._id
    }));
    res.json(modifiedStages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single stage by ID
router.get('/fetch/:id', async (req, res) => {
  try {
    const stage = await Stage.findOne({ _id: req.params.id });
    if (!stage) {
      return res.status(404).json({ error: 'Stage not found' });
    }
    res.json(stage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a stage
router.put('/update/:id', async (req, res) => {
  try {
    const updatedStage = req.body;
    const stage = await Stage.findByIdAndUpdate(req.params.id, updatedStage, { new: true });
    if (!stage) {
      return res.status(404).json({ error: 'Stage not found' });
    }
    res.json(stage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a stage
router.delete('/delete/:id', async (req, res) => {
  try {
    const stageId = req.params.id;
    const stage = await Stage.findByIdAndDelete(stageId);
    if (!stage) {
      return res.status(404).json({ error: 'Stage not found' });
    }
    res.json({ message: 'Stage deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
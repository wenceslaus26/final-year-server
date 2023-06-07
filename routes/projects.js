const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const Project = require('../models/project-model');
const Stage = require('../models/stages-model');
const authenticateToken = require('../middleware/authMiddleware');

// Create a new project
router.post('/create', async (req, res) => {
  try {
    const existingProject = await Project.findOne({ projectId: req.body.projectId });
    if (existingProject) {
      return res.status(400).json({ error: 'Project with the same projectId already exists' });
    }

    const userEmail = req.body.email;

    const stages = await Stage.find({ stageOwner: userEmail });

    const projectStages = stages.map(stage => {
      return {
        stageId: stage.stageId,
        stageName: stage.stageName,
        stageStatus: stage.stageStatus
      };
    });

    const projectData = new Project({
      projectId: uuidv4(),
      projectName: req.body.projectName,
      projectDescription: req.body.projectDescription,
      projectOwner: req.body.projectOwner,
      projectStages: projectStages,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      projectStatus: req.body.projectStatus
    });

    const savedProject = await projectData.save();

    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/fetch', authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;

    const projects = await Project.find({ projectOwner: email });

    const projectIds = projects.map((project) => project._id);
    const stages = await Stage.find({ projectId: { $in: projectIds } });

    const projectData = projects.map((project) => {
      const projectStages = stages
        .filter((stage) => stage.projectId.equals(project._id))
        .map((stage) => ({
          stageId: stage._id,
          stageName: stage.stageName,
          stageStatus: stage.stageStatus
        }));

      return {
        projectId: project._id,
        projectName: project.projectName,
        projectDescription: project.projectDescription,
        projectOwner: project.projectOwner,
        projectStages: projectStages,
        startDate: project.startDate,
        endDate: project.endDate,
        projectStatus: project.projectStatus
      };
    });

    res.status(200).json(projectData);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Get a single project by ID
router.get('/fetch/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a project
router.put('/update/:id', async (req, res) => {
  try {
    const updatedProject = req.body;
    const project = await Project.findByIdAndUpdate(req.params.id, updatedProject, { new: true });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a project
router.delete('/delete/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const signupRouter = require('./routes/signup');
const loginRouter = require('./routes/login');
const projectRoutes = require('./routes/projects');
const stageRoutes = require('./routes/stages');
const profileRouter = require('./routes/profile');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection URI
const uri = 'mongodb://localhost:27017/final-year-project';

// Connect to the MongoDB database
mongoose
.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('Connected to the database');
  app.listen(3000);
  console.log('app connected on port 3000');
})
.catch((error) => {
  console.error('Failed to connect to the database:', error);
});

app.use(express.json());

app.use('/', signupRouter);
app.use('/', loginRouter);
app.use('/projects', projectRoutes);
app.use('/stage', stageRoutes)
app.use('/', profileRouter);
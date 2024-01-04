const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

const Message = require('./models/messages-model');
const messageController = require('./controllers/messagesController')

const signupRouter = require('./routes/signup');
const loginRouter = require('./routes/login');
const projectRoutes = require('./routes/projects');
const stageRoutes = require('./routes/stages');
const profileRouter = require('./routes/profile');
const tasksRouter = require('./routes/tasks');
const messagesRouter = require('./routes/messages');
const userRouter = require('./routes/users');
const fileRouter = require('./routes/file-sharing');
const calendarRouter = require('./routes/calendar');

const app = express();

const whitelist = ['http://localhost:4200'];

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

app.use(express.json());

// Create an HTTP server instance
const server = http.createServer(app);

// Create a Socket.IO instance and attach it to the server
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// MongoDB connection URI
const uri = 'mongodb://localhost:27017/final-year-project';

// Connect to the MongoDB database
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to the database');
    server.listen(3000, () => {
      console.log('App connected on port 3000');
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
  });

app.use(express.json());

app.use('/', signupRouter);
app.use('/', loginRouter);
app.use('/projects', projectRoutes);
app.use('/stage', stageRoutes);
app.use('/', profileRouter);
app.use('/', tasksRouter);
app.use('/messages', messagesRouter);
app.use('/user', userRouter);
app.use('/file', fileRouter);
app.use('/dates', calendarRouter);

const userMappings = global.userMappings || {};

function getRecipientSocket(recipientEmail) {
  const recipient = userMappings[recipientEmail];
  return recipient ? recipient.socketId : null;
}

// WebSocket event handlers
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Store the user's email and socket ID mapping when they connect
  socket.on('storeUserMapping', (email) => {
    userMappings[email] = { socketId: socket.id };
  });

  // Handle incoming messages
  socket.on('sendMessage', (message) => {
    console.log('Received message:', message);

    const receivedMessage = message

    console.log(receivedMessage);

    messageController.sendMessage(receivedMessage, socket.id)
    .then(newMessage => {
      console.log(socket.id);
      const recipientSocket = getRecipientSocket(message.recipient);
      if (recipientSocket) {
        const recipientMessage = io.to(recipientSocket).emit('message', newMessage);
        console.log(recipientMessage);
      }
    })
    .catch(error => {
      console.error('Error sending message:', error);
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);

    // Remove the user mapping when they disconnect
    const disconnectedUser = Object.keys(userMappings).find(
      (email) => userMappings[email].socketId === socket.id
    );
    if (disconnectedUser) {
      delete userMappings[disconnectedUser];
    }
  });
});

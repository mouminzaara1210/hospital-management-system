require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*', // TODO: restrict in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Pass io instance to express app so routes can use it
app.set('socketio', io);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/clinical', require('./routes/clinicalRoutes'));
app.use('/api/beds', require('./routes/bedRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Basic default route
app.get('/', (req, res) => {
  res.send('HMS API is running...');
});

// Socket.io event handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins a personal room
  socket.on('join:user', (userId) => {
    socket.join(`room:${userId}`);
    console.log(`User ${userId} joined their personal room.`);
  });

  // Staff joins a ward room
  socket.on('join:ward', (wardName) => {
    socket.join(`room:ward:${wardName}`);
    console.log(`Staff joined ward room: ${wardName}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

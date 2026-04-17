require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'], // Explicitly prefer websocket
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000
});

// Middleware to inject IO into requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/job-mela', require('./routes/jobmela'));
app.use('/api/hero-banners', require('./routes/heroBanners'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/prep-data', require('./routes/prepData'));

app.get('/', (req, res) => {
  res.send('Strataply Operational API Running');
});

io.on('connection', (socket) => {
  console.log('Operational Manager / Admin connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Operational Server running on port ${PORT}`);
});
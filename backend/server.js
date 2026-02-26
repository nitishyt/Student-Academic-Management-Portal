const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const facultyRoutes = require('./routes/faculties');
const attendanceRoutes = require('./routes/attendance');
const resultRoutes = require('./routes/results');

const app = express();

connectDB();

// CORS configuration: allow all localhost ports in dev, specific origins in production
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : [
      /^http:\/\/localhost(:\d+)?$/,  // Allow any localhost port in development
      'https://student-academic-management-portal-1.onrender.com',
    ];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

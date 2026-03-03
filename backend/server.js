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

// CORS configuration
const envCorsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

const defaultCorsOrigins = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  'https://student-portal-1-3z5l.onrender.com'
];

const corsOrigins = [...defaultCorsOrigins, ...envCorsOrigins];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed = corsOrigins.some((allowedOrigin) => {
      if (allowedOrigin instanceof RegExp) return allowedOrigin.test(origin);
      return allowedOrigin === origin;
    });

    if (isAllowed) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
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

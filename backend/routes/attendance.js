const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { auth, authorize } = require('../middleware/auth');

router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const studentId = req.params.studentId;
    
    // Validate ObjectId
    if (!studentId || !studentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.json([]);
    }

    const filter = { studentId };

    if (month && year) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(filter).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    console.error('Attendance error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { studentId, date, time, subject, status } = req.body;

    let attendance = await Attendance.findOne({ studentId, date });

    if (attendance) {
      attendance.lectures.push({ time, subject, status, markedBy: req.user.id });
      await attendance.save();
    } else {
      attendance = new Attendance({
        studentId,
        date,
        lectures: [{ time, subject, status, markedBy: req.user.id }]
      });
      await attendance.save();
    }

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// generate QR token for class (faculty/admin only)
router.post('/qr', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { standard, branch, date, time, subject } = req.body;
    if (!standard || !branch || !date || !time || !subject) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payload = { standard, branch, date, time, subject, facultyId: req.user.id };
    const code = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });
    res.json({ code });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// scan QR and mark attendance (students must supply credentials)
router.post('/scan', async (req, res) => {
  try {
    const { code, username, password } = req.body;
    if (!code || !username || !password) {
      return res.status(400).json({ error: 'code, username and password required' });
    }

    const user = await User.findOne({ username, role: 'student' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    let payload;
    try { payload = jwt.verify(code, process.env.JWT_SECRET); }
    catch (e) { return res.status(400).json({ error: 'Invalid or expired QR code' }); }

    const student = await Student.findOne({ userId: user._id });
    if (!student) return res.status(404).json({ error: 'Student record not found' });
    if (student.standard !== payload.standard || student.branch !== payload.branch) {
      return res.status(403).json({ error: 'You are not enrolled in this class' });
    }

    const existing = await Attendance.findOne({ studentId: student._id, date: payload.date, 'lectures.subject': payload.subject });
    if (existing) {
      const lecture = existing.lectures.find(l => l.subject === payload.subject);
      if (lecture && lecture.status === 'present') {
        return res.status(200).json({ message: 'Attendance already marked' });
      }
    }

    let attendance = await Attendance.findOne({ studentId: student._id, date: payload.date });
    if (attendance) {
      attendance.lectures.push({ time: payload.time, subject: payload.subject, status: 'present', markedBy: user._id });
      await attendance.save();
    } else {
      attendance = new Attendance({ studentId: student._id, date: payload.date, lectures: [{ time: payload.time, subject: payload.subject, status: 'present', markedBy: user._id }] });
      await attendance.save();
    }

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({ error: error.message });
  }
});

// original stats route
router.get('/stats/:studentId', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;

    const attendance = await Attendance.find({
      studentId: req.params.studentId,
      date: { $gte: startDate, $lte: endDate }
    });

    let totalDays = 0;
    let presentDays = 0;

    attendance.forEach(record => {
      const date = new Date(record.date);
      if (date.getDay() !== 0) {
        totalDays++;
        const hasPresent = record.lectures.some(l => l.status === 'present');
        if (hasPresent) presentDays++;
      }
    });

    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    res.json({ total: totalDays, present: presentDays, absent: totalDays - presentDays, percentage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

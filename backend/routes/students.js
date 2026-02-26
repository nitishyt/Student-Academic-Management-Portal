const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { branch, standard } = req.query;
    const filter = {};
    if (branch) filter.branch = branch;
    if (standard) filter.standard = standard;

    const students = await Student.find(filter).sort({ rollNo: 1 });

    // Ensure username/password fields are present (for records created before this fix)
    const studentsWithCreds = students.map(s => {
      const obj = s.toObject();
      obj.id = obj._id;
      if (!obj.username) {
        const firstName = obj.name.split(' ')[0].toLowerCase();
        obj.username = firstName + obj.rollNo.toString().toLowerCase();
      }
      if (!obj.password) {
        const firstName = obj.name.split(' ')[0].toLowerCase();
        obj.password = firstName + (obj.branch || '').toLowerCase() + obj.rollNo.toString().toLowerCase();
      }
      if (!obj.parentUsername) {
        const firstName = obj.name.split(' ')[0].toLowerCase();
        obj.parentUsername = 'p' + firstName + obj.rollNo.toString().toLowerCase();
      }
      if (!obj.parentPassword) {
        const firstName = obj.name.split(' ')[0].toLowerCase();
        obj.parentPassword = firstName + (obj.branch || '').toLowerCase() + obj.rollNo.toString().toLowerCase();
      }
      return obj;
    });

    res.json(studentsWithCreds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, rollNo, branch, standard, phone } = req.body;

    const firstName = name.split(' ')[0].toLowerCase();
    const username = firstName + rollNo.toString().toLowerCase();
    const password = firstName + branch.toLowerCase() + rollNo.toString().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashedPassword, role: 'student' });
    await user.save();

    const parentUsername = 'p' + username;
    const parentUser = new User({ username: parentUsername, password: hashedPassword, role: 'parent' });
    await parentUser.save();

    const student = new Student({
      userId: user._id,
      name,
      rollNo,
      branch,
      standard,
      phone,
      username,
      password,
      parentUsername,
      parentPassword: password
    });
    await student.save();

    res.status(201).json({
      id: student._id,
      name,
      rollNo,
      branch,
      standard,
      phone,
      username,
      password,
      parentUsername,
      parentPassword: password
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete student user account
    await User.findByIdAndDelete(student.userId);

    // Delete parent user account
    await User.deleteOne({ username: student.parentUsername, role: 'parent' });

    // Delete all attendance records
    const Attendance = require('../models/Attendance');
    await Attendance.deleteMany({ studentId: req.params.id });

    // Delete all results
    const Result = require('../models/Result');
    await Result.deleteMany({ studentId: req.params.id });

    res.json({ message: 'Student and all related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Faculty = require('../models/Faculty');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const faculties = await Faculty.find();

    // Ensure username/password fields are present (for records created before this fix)
    const facultiesWithCreds = await Promise.all(faculties.map(async (f) => {
      const obj = f.toObject();
      if (!obj.username || !obj.password) {
        const user = await User.findById(obj.userId);
        if (user) {
          if (!obj.username) obj.username = user.username;
          if (!obj.password) obj.password = '(set during creation - check with admin)';
        }
      }
      return obj;
    }));

    res.json(facultiesWithCreds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, username, password, subject, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashedPassword, role: 'faculty' });
    await user.save();

    const faculty = new Faculty({ userId: user._id, name, username, password, subject, email });
    await faculty.save();

    res.status(201).json({ id: faculty._id, name, username, password, subject, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const facultyId = req.params.id;

    // Validate ObjectId
    if (!facultyId || !facultyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid faculty ID' });
    }

    const faculty = await Faculty.findByIdAndDelete(facultyId);
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    await User.findByIdAndDelete(faculty.userId);
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Faculty delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

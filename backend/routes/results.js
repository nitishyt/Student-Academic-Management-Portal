const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const { auth, authorize } = require('../middleware/auth');

router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Validate ObjectId
    if (!studentId || !studentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.json([]);
    }

    const results = await Result.find({ studentId }).sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    console.error('Results error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { studentId, subject, marks, pdfFile, pdfFilename } = req.body;

    if (pdfFile) {
      const sizeInBytes = (pdfFile.length * 3) / 4;
      const sizeInKB = sizeInBytes / 1024;
      if (sizeInKB > 500) {
        return res.status(400).json({ error: 'File size exceeds 500KB limit' });
      }
    }

    const result = new Result({
      studentId,
      subject,
      marks,
      pdfFile: pdfFile || null,
      pdfFilename: pdfFilename || null,
      uploadedBy: req.user.id
    });
    await result.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

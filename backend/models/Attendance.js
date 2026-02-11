const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  time: { type: String, required: true },
  subject: { type: String, required: true },
  status: { type: String, enum: ['present', 'absent'], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: String, required: true },
  lectures: [lectureSchema],
  createdAt: { type: Date, default: Date.now }
});

attendanceSchema.index({ studentId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

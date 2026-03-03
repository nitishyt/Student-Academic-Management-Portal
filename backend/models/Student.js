const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  branch: { type: String, enum: ['DS', 'AIML', 'IT', 'COMPS'], required: true },
  standard: { type: String, enum: ['FE', 'SE', 'TE', 'BE'], required: true },
  phone: { type: String, required: true },
  username: { type: String },
  password: { type: String },
  parentUsername: { type: String },
  parentPassword: { type: String },
  createdAt: { type: Date, default: Date.now }
});

studentSchema.index({ branch: 1, standard: 1 });
// Manual index for rollNo is redundant because unique: true is already set in the schema.
// studentSchema.index({ rollNo: 1 });

module.exports = mongoose.model('Student', studentSchema);

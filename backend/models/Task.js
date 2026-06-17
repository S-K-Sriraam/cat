const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, enum: ['VARC', 'DILR', 'QA'] },
  topic: { type: String, trim: true },
  date: { type: String, required: true },  // ISO date string YYYY-MM-DD
  hours: { type: Number, default: 1, min: 0.5, max: 12 },
  done: { type: Boolean, default: false },
  notes: { type: String, trim: true },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

taskSchema.index({ user: 1, date: 1 });

taskSchema.pre('save', function(next) {
  if (this.isModified('done') && this.done && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);

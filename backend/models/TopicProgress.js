const mongoose = require('mongoose');

const topicProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, enum: ['VARC', 'DILR', 'QA'] },
  topicKey: { type: String, required: true },  // e.g. "QA_Number System"
  topicName: { type: String, required: true },
  percentage: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'revision_pending'],
    default: 'not_started'
  },
  lastStudied: { type: Date },
  notes: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

topicProgressSchema.index({ user: 1, topicKey: 1 }, { unique: true });

topicProgressSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.isModified('percentage')) {
    if (this.percentage === 0) this.status = 'not_started';
    else if (this.percentage === 100) this.status = 'completed';
    else this.status = 'in_progress';
  }
  next();
});

module.exports = mongoose.model('TopicProgress', topicProgressSchema);

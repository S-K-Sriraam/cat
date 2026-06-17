const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  scores: {
    varc: { type: Number, default: 0, min: 0, max: 72 },
    dilr: { type: Number, default: 0, min: 0, max: 60 },
    qa:   { type: Number, default: 0, min: 0, max: 76 }
  },
  totalScore: { type: Number },
  percentile: { type: Number, min: 0, max: 100 },
  timeSpent: { type: Number },  // minutes
  notes: { type: String, trim: true },
  attemptedBy: { type: String, trim: true },  // e.g. "IMS", "TIME", "CL"
  createdAt: { type: Date, default: Date.now }
});

mockTestSchema.pre('save', function(next) {
  this.totalScore = (this.scores.varc || 0) + (this.scores.dilr || 0) + (this.scores.qa || 0);
  next();
});

module.exports = mongoose.model('MockTest', mockTestSchema);

const express = require('express');
const router = express.Router();
const TopicProgress = require('../models/TopicProgress');
const auth = require('../middleware/auth');

// GET /api/progress
router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.userId };
    if (req.query.subject) filter.subject = req.query.subject;
    const progress = await TopicProgress.find(filter);
    res.json({ progress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress.' });
  }
});

// PUT /api/progress/:topicKey — upsert progress for a topic
router.put('/:topicKey', auth, async (req, res) => {
  try {
    const { percentage, subject, topicName, notes } = req.body;
    const topicKey = decodeURIComponent(req.params.topicKey);

    const progress = await TopicProgress.findOneAndUpdate(
      { user: req.userId, topicKey },
      {
        user: req.userId, topicKey, subject, topicName,
        percentage: Math.min(100, Math.max(0, percentage || 0)),
        notes,
        lastStudied: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ progress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress.' });
  }
});

// GET /api/progress/summary
router.get('/summary/all', auth, async (req, res) => {
  try {
    const progress = await TopicProgress.aggregate([
      { $match: { user: req.userId } },
      { $group: {
        _id: '$subject',
        avgPct: { $avg: '$percentage' },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        total: { $sum: 1 }
      }}
    ]);
    res.json({ summary: progress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress summary.' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const MockTest = require('../models/MockTest');
const auth = require('../middleware/auth');

// GET /api/mocks
router.get('/', auth, async (req, res) => {
  try {
    const mocks = await MockTest.find({ user: req.userId }).sort({ date: -1, createdAt: -1 });
    res.json({ mocks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mock tests.' });
  }
});

// POST /api/mocks
router.post('/', auth, async (req, res) => {
  try {
    const { name, date, scores, percentile, timeSpent, notes, attemptedBy } = req.body;
    if (!name || !date) return res.status(400).json({ error: 'Name and date are required.' });

    const mock = await MockTest.create({
      user: req.userId, name, date,
      scores: scores || { varc: 0, dilr: 0, qa: 0 },
      percentile, timeSpent, notes, attemptedBy
    });
    res.status(201).json({ mock });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log mock test.' });
  }
});

// PATCH /api/mocks/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const mock = await MockTest.findOne({ _id: req.params.id, user: req.userId });
    if (!mock) return res.status(404).json({ error: 'Mock test not found.' });

    const allowed = ['name', 'date', 'scores', 'percentile', 'timeSpent', 'notes', 'attemptedBy'];
    allowed.forEach(f => { if (req.body[f] !== undefined) mock[f] = req.body[f]; });
    await mock.save();
    res.json({ mock });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update mock test.' });
  }
});

// DELETE /api/mocks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const mock = await MockTest.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!mock) return res.status(404).json({ error: 'Mock test not found.' });
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete mock test.' });
  }
});

// GET /api/mocks/stats/trend
router.get('/stats/trend', auth, async (req, res) => {
  try {
    const mocks = await MockTest.find({ user: req.userId }).sort({ date: 1 });
    const best = mocks.length ? Math.max(...mocks.map(m => m.totalScore)) : 0;
    const latest = mocks[mocks.length - 1];
    const avg = mocks.length ? Math.round(mocks.reduce((s, m) => s + m.totalScore, 0) / mocks.length) : 0;
    res.json({ count: mocks.length, best, avg, latest: latest || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mock stats.' });
  }
});

module.exports = router;

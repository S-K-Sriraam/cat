const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// GET /api/tasks?date=YYYY-MM-DD&week=YYYY-MM-DD (all tasks or by date)
router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.userId };
    if (req.query.date) filter.date = req.query.date;
    if (req.query.subject) filter.subject = req.query.subject;

    // Week range
    if (req.query.from && req.query.to) {
      filter.date = { $gte: req.query.from, $lte: req.query.to };
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// POST /api/tasks
router.post('/', auth, async (req, res) => {
  try {
    const { title, subject, topic, date, hours, notes } = req.body;
    if (!title || !subject || !date) {
      return res.status(400).json({ error: 'Title, subject and date are required.' });
    }

    const task = await Task.create({
      user: req.userId, title, subject, topic, date,
      hours: hours || 1, notes
    });
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PATCH /api/tasks/:id — update task (toggle done, edit fields)
router.patch('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const allowed = ['title', 'subject', 'topic', 'date', 'hours', 'done', 'notes'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// GET /api/tasks/stats/summary — dashboard stats
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [todayTasks, totalDone, subjectBreakdown] = await Promise.all([
      Task.find({ user: req.userId, date: today }),
      Task.countDocuments({ user: req.userId, done: true }),
      Task.aggregate([
        { $match: { user: req.userId, done: true } },
        { $group: { _id: '$subject', count: { $sum: 1 }, hours: { $sum: '$hours' } } }
      ])
    ]);

    const totalHours = await Task.aggregate([
      { $match: { user: req.userId, done: true } },
      { $group: { _id: null, total: { $sum: '$hours' } } }
    ]);

    // Streak calculation
    const completedDates = await Task.distinct('date', { user: req.userId, done: true });
    const sortedDates = completedDates.sort().reverse();
    let streak = 0;
    const todayStr = today;
    let checkDate = new Date(todayStr);
    for (let i = 0; i < 365; i++) {
      const ds = checkDate.toISOString().slice(0, 10);
      if (sortedDates.includes(ds)) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }

    res.json({
      todayTasks: todayTasks.length,
      todayDone: todayTasks.filter(t => t.done).length,
      totalDone,
      totalHours: totalHours[0]?.total || 0,
      subjectBreakdown,
      streak
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

module.exports = router;

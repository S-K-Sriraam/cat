const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const TopicProgress = require('../models/TopicProgress');
const auth = require('../middleware/auth');
const { syllabus, allTopics } = require('../data/syllabus');

const today = () => new Date().toISOString().slice(0, 10);

function chooseNextTopics(progressDocs, limit = 4) {
  const progress = new Map(progressDocs.map(item => [item.topicKey, item.percentage]));
  return allTopics()
    .map(topic => ({
      ...topic,
      progress: progress.get(topic.key) || 0,
      score: (topic.weight * 12) - ((progress.get(topic.key) || 0) * 0.9) - (topic.priority * 2)
    }))
    .filter(topic => topic.progress < 100)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function fallbackReply(message, user, tasks, progressDocs) {
  const nextTopics = chooseNextTopics(progressDocs, 5);
  const doneCount = tasks.filter(task => task.done).length;
  const pending = tasks.filter(task => !task.done);
  const lower = (message || '').toLowerCase();

  if (lower.includes('doubt') || lower.includes('explain') || lower.includes('solve')) {
    return [
      'Tell me the exact question or concept you are stuck on and I will break it into steps.',
      'For CAT prep, the fastest doubt-clearing method is: identify the set type, write the givens, mark constraints, solve one case slowly, then generalize the shortcut.',
      `Your next high-value revision topic is ${nextTopics[0]?.name || 'Reading Comprehension'}.`
    ].join('\n\n');
  }

  if (lower.includes('today') || lower.includes('plan') || lower.includes('schedule')) {
    const suggestions = nextTopics.slice(0, 3).map((topic, index) =>
      `${index + 1}. ${topic.subject}: ${topic.name} - ${index === 0 ? 'concept + examples' : 'timed practice'}`
    ).join('\n');
    return [
      `For today, keep it focused: ${pending.length} pending task(s), ${doneCount} completed.`,
      suggestions,
      'Suggested split: 70 minutes concept/practice, 35 minutes sectional drill, 25 minutes analysis. End with 10 minutes of error-log revision.'
    ].join('\n\n');
  }

  return [
    `Hi ${user.name.split(' ')[0]}, I am your CAT prep assistant.`,
    `Based on weightage, start with ${nextTopics[0]?.name || 'Arithmetic'} and then ${nextTopics[1]?.name || 'DILR Caselets'}.`,
    'Ask me to "plan today", "prioritize topics", or paste a doubt/question.'
  ].join('\n\n');
}

async function openAiReply(message, context) {
  if (!process.env.OPENAI_API_KEY) return null;

  const prompt = [
    'You are an inbuilt CAT exam preparation coach inside a student planner web app.',
    'Be practical, concise, and supportive. Use the provided syllabus, topic weightage, user tasks, and progress.',
    'Do not invent exam facts. If a doubt lacks details, ask for the exact question.',
    '',
    `User message: ${message}`,
    '',
    `Context: ${JSON.stringify(context)}`
  ].join('\n');

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      input: prompt,
      max_output_tokens: 500
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('OpenAI API error:', detail);
    return null;
  }

  const data = await response.json();
  return data.output_text || data.output?.flatMap(item => item.content || []).map(part => part.text).filter(Boolean).join('\n') || null;
}

router.get('/syllabus', auth, (req, res) => {
  res.json({ syllabus });
});

router.get('/recommendations', auth, async (req, res) => {
  try {
    const [tasks, progress] = await Promise.all([
      Task.find({ user: req.userId, date: today() }),
      TopicProgress.find({ user: req.userId })
    ]);
    res.json({
      date: today(),
      nextTopics: chooseNextTopics(progress, 6),
      todayTasks: tasks
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to prepare recommendations.' });
  }
});

router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const [tasks, progress] = await Promise.all([
      Task.find({ user: req.userId, date: today() }),
      TopicProgress.find({ user: req.userId })
    ]);
    const context = {
      user: {
        name: req.user.name,
        targetPercentile: req.user.targetPercentile,
        examDate: req.user.examDate
      },
      syllabus,
      todayTasks: tasks,
      progress: progress.map(item => ({
        topicKey: item.topicKey,
        topicName: item.topicName,
        subject: item.subject,
        percentage: item.percentage
      })),
      recommendations: chooseNextTopics(progress, 5)
    };

    const aiText = await openAiReply(message, context);
    res.json({
      reply: aiText || fallbackReply(message, req.user, tasks, progress),
      provider: aiText ? 'openai' : 'local-planner'
    });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'AI assistant failed. Please try again.' });
  }
});

module.exports = router;

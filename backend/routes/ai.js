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

function extractStudyHours(message) {
  const match = String(message || '').match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|hr|h)\b/i);
  if (!match) return null;

  const hours = Number(match[1]);
  return Number.isFinite(hours) && hours > 0 ? Math.min(hours, 24) : null;
}

function hasAny(text, words) {
  return words.some(word => text.includes(word));
}

function detectSubject(message) {
  const lower = String(message || '').toLowerCase();
  if (hasAny(lower, ['varc', 'reading', 'rc', 'verbal', 'para jumble', 'summary'])) return 'VARC';
  if (hasAny(lower, ['dilr', 'lrdi', 'di lr', 'caselet', 'tables', 'charts', 'arrangement', 'puzzle', 'venn'])) return 'DILR';
  if (hasAny(lower, ['qa', 'quant', 'arithmetic', 'algebra', 'geometry', 'percentage', 'ratio', 'averages', 'number system'])) return 'QA';
  return null;
}

function relevantTopicsForSubject(subject, progressDocs, limit = 4) {
  const nextTopics = chooseNextTopics(progressDocs, 30);
  return nextTopics.filter(topic => topic.subject === subject).slice(0, limit);
}

function formatHours(value) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}h` : `${rounded.toFixed(1)}h`;
}

function buildHourAllocation(totalHours, progressDocs) {
  const nextTopics = chooseNextTopics(progressDocs, 8);
  const allocation = [
    {
      subject: 'QA',
      percent: 45,
      focus: relevantTopicsForSubject('QA', progressDocs, 2).map(topic => topic.name).join(', ') || 'Arithmetic and Algebra'
    },
    {
      subject: 'DILR',
      percent: 35,
      focus: relevantTopicsForSubject('DILR', progressDocs, 2).map(topic => topic.name).join(', ') || 'Tables, Caselets and Arrangements'
    },
    {
      subject: 'VARC',
      percent: 20,
      focus: relevantTopicsForSubject('VARC', progressDocs, 2).map(topic => topic.name).join(', ') || 'Reading Comprehension and Para Summary'
    }
  ];

  const lines = allocation.map(item =>
    `- ${item.subject}: ${item.percent}% = ${formatHours((totalHours * item.percent) / 100)}. Focus: ${item.focus}.`
  );

  return [
    `For ${formatHours(totalHours)}, use this CAT-focused split:`,
    lines.join('\n'),
    '',
    'Execution rule: keep every 2-hour block as 75 minutes practice + 30 minutes analysis + 15 minutes error-log/formula revision.',
    `Start with: ${nextTopics.slice(0, 3).map(topic => `${topic.subject} ${topic.name}`).join(' → ') || 'QA Arithmetic → DILR Tables → VARC RC'}.`
  ].join('\n');
}

function buildSubjectPlan(subject, progressDocs) {
  const topics = relevantTopicsForSubject(subject, progressDocs, 4);
  const defaultBySubject = {
    QA: ['Arithmetic: Percentages, Ratio, Averages', 'Profit Loss, SI-CI, Time and Work', 'Algebra: Functions and Graphs'],
    DILR: ['Tables', 'Data Caselets', 'Arrangements and Scheduling Puzzles'],
    VARC: ['Reading Comprehension', 'Para Jumbles and Odd One Out', 'Para Summary and Para Completion']
  };
  const topicNames = topics.length ? topics.map(topic => topic.name) : defaultBySubject[subject];

  const method = {
    QA: 'First revise formulas/concepts, then solve 20 medium questions timed, then redo every wrong question without seeing the solution.',
    DILR: 'Solve 2 sets slowly for structure, then 2 sets timed. After each set, write the key inference you missed.',
    VARC: 'Do 3 RC passages with strict timing, review why each wrong option was tempting, then practice 8 VA questions.'
  };

  return [
    `${subject} plan for your next session:`,
    topicNames.map((name, index) => `${index + 1}. ${name}`).join('\n'),
    '',
    method[subject],
    'Output target: finish with a short error log: concept gap, careless error, or time-management issue.'
  ].join('\n');
}

function buildRevisionPlan(progressDocs) {
  const nextTopics = chooseNextTopics(progressDocs, 6);
  return [
    'Use a 3-layer revision cycle:',
    '1. Recall: write formulas/rules from memory for 10 minutes.',
    '2. Timed practice: solve a small mixed set without pausing.',
    '3. Error log: classify every miss as concept, calculation, trap, or time pressure.',
    '',
    'Revise in this order now:',
    nextTopics.slice(0, 5).map((topic, index) => `${index + 1}. ${topic.subject}: ${topic.name} (${topic.progress}% complete)`).join('\n')
  ].join('\n');
}

function buildMockAdvice() {
  return [
    'For mock analysis, do not only check the score. Split it into:',
    '1. Easy questions missed: highest priority fixes.',
    '2. Time sinks: questions you should have skipped earlier.',
    '3. Concept gaps: topics needing revision.',
    '4. Guessing errors: reduce negative attempts.',
    '',
    'Next mock target: improve selection accuracy first, then speed. Send me your VARC/DILR/QA scores and attempts, and I will diagnose the exact section strategy.'
  ].join('\n');
}

function buildDoubtReply(message, progressDocs) {
  const subject = detectSubject(message);
  const nextTopic = subject
    ? relevantTopicsForSubject(subject, progressDocs, 1)[0]
    : chooseNextTopics(progressDocs, 1)[0];

  return [
    'Paste the exact question, options, and where you got stuck. I will solve it step by step.',
    '',
    'Until then, use this doubt-clearing format:',
    '1. Identify the topic and question type.',
    '2. List the given data/constraints.',
    '3. Solve one clean method slowly.',
    '4. Extract the shortcut or trap for your error log.',
    '',
    `Likely high-value topic for you right now: ${nextTopic ? `${nextTopic.subject}: ${nextTopic.name}` : 'QA Arithmetic'}.`
  ].join('\n');
}

function fallbackReply(message, user, tasks, progressDocs) {
  const nextTopics = chooseNextTopics(progressDocs, 5);
  const doneCount = tasks.filter(task => task.done).length;
  const pending = tasks.filter(task => !task.done);
  const lower = (message || '').toLowerCase();
  const hours = extractStudyHours(message);
  const subject = detectSubject(message);
  const asksAllocation = hasAny(lower, ['percentage', 'percentages', 'percent', 'split', 'allocation', 'allocate', 'how much time', 'hrs in', 'hours in']);
  const asksPriority = hasAny(lower, ['priority', 'prioritize', 'which topic', 'what topic', 'start with', 'first']);
  const asksRevision = hasAny(lower, ['revise', 'revision', 'review', 'recap']);
  const asksMock = hasAny(lower, ['mock', 'score', 'percentile', 'attempts', 'accuracy']);

  if (hours && asksAllocation) {
    return buildHourAllocation(hours, progressDocs);
  }

  if (lower.includes('doubt') || lower.includes('explain') || lower.includes('solve')) {
    return buildDoubtReply(message, progressDocs);
  }

  if (asksMock) {
    return buildMockAdvice();
  }

  if (asksRevision) {
    return buildRevisionPlan(progressDocs);
  }

  if (subject) {
    return buildSubjectPlan(subject, progressDocs);
  }

  if (asksPriority) {
    return [
      'Your current priority order should be:',
      nextTopics.slice(0, 5).map((topic, index) =>
        `${index + 1}. ${topic.subject}: ${topic.name} — weight ${topic.weight}/10, progress ${topic.progress}%.`
      ).join('\n'),
      '',
      'Rule: finish high-weight low-progress topics first, but keep one VARC reading block daily so reading speed does not drop.'
    ].join('\n');
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
    `Hi ${user.name.split(' ')[0]}, I can help with a specific CAT plan, topic priority, mock analysis, revision, or a pasted doubt.`,
    `Right now, your best next topic is ${nextTopics[0] ? `${nextTopics[0].subject}: ${nextTopics[0].name}` : 'QA: Arithmetic'}.`,
    'Ask in a concrete way, for example: "split 20 hours by percentage", "make a QA arithmetic plan", "analyze my mock score", or paste a full question.'
  ].join('\n\n');
}

async function openAiReply(message, context) {
  if (!process.env.OPENAI_API_KEY) return null;

  const prompt = [
    'You are an inbuilt CAT exam preparation coach inside a student planner web app.',
    'Answer the exact question asked. Do not repeat a generic daily-plan template unless the user asks for a daily plan.',
    'Be practical, concise, and specific. Use the provided syllabus, topic weightage, user tasks, and progress.',
    'If the user asks for hour/percentage allocation, calculate the split clearly.',
    'If the user asks a QA/DILR/VARC concept question, explain the concept and give a CAT-style practice method.',
    'If the user asks for mock analysis, ask for scores/attempts if missing and give a diagnostic framework.',
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

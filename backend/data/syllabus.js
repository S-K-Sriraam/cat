const syllabus = [
  {
    key: 'VARC',
    name: 'Verbal Ability and Reading Comprehension',
    examWeight: '24 questions',
    priority: 4,
    color: '#7c3aed',
    topics: [
      { name: 'Reading Comprehension', weight: 10, priority: 1, source: 'CAT pattern' },
      { name: 'Para Jumbles and Odd One Out', weight: 7, priority: 2, source: 'CAT pattern' },
      { name: 'Para Summary and Para Completion', weight: 6, priority: 3, source: 'CAT pattern' },
      { name: 'Critical Reasoning', weight: 5, priority: 4, source: 'CAT pattern' },
      { name: 'Grammar and Usage', weight: 3, priority: 5, source: 'supporting skill' },
      { name: 'Vocabulary, Idioms and Phrases', weight: 2, priority: 6, source: 'supporting skill' }
    ]
  },
  {
    key: 'DILR',
    name: 'Data Interpretation and Logical Reasoning',
    examWeight: '22 questions',
    priority: 1,
    color: '#0f766e',
    topics: [
      { name: 'Tables', weight: 10, priority: 1, source: 'uploaded syllabus' },
      { name: 'Bar Graphs', weight: 9, priority: 2, source: 'uploaded syllabus' },
      { name: 'Line Graphs and X-Y Charts', weight: 9, priority: 3, source: 'uploaded syllabus' },
      { name: 'Pie Charts', weight: 8, priority: 4, source: 'uploaded syllabus' },
      { name: 'Data Caselets', weight: 10, priority: 5, source: 'uploaded syllabus' },
      { name: 'Mixed and Miscellaneous Charts', weight: 8, priority: 6, source: 'uploaded syllabus' },
      { name: 'Arrangements and Scheduling Puzzles', weight: 9, priority: 7, source: 'uploaded syllabus' },
      { name: 'Games and Tournaments', weight: 8, priority: 8, source: 'uploaded syllabus' },
      { name: 'Set Theory and Venn Diagrams', weight: 8, priority: 9, source: 'uploaded syllabus' },
      { name: 'Routes and Network Diagrams', weight: 6, priority: 10, source: 'uploaded syllabus' },
      { name: 'Binary Logic and Logical Deductions', weight: 5, priority: 11, source: 'uploaded syllabus' },
      { name: 'Syllogisms, Statements and Assumptions', weight: 4, priority: 12, source: 'uploaded syllabus' },
      { name: 'Blood Relations, Directions and Coding Decoding', weight: 3, priority: 13, source: 'uploaded syllabus' },
      { name: 'Visual Reasoning', weight: 2, priority: 14, source: 'uploaded syllabus' }
    ]
  },
  {
    key: 'QA',
    name: 'Quantitative Aptitude',
    examWeight: '22 questions',
    priority: 2,
    color: '#2563eb',
    topics: [
      { name: 'Arithmetic: Percentages, Ratio, Averages', weight: 10, priority: 1, block: 'Block II 40-50%' },
      { name: 'Profit Loss, SI-CI, Time and Work', weight: 10, priority: 2, block: 'Block II 40-50%' },
      { name: 'Time Speed Distance and Applications', weight: 9, priority: 3, block: 'Block II 40-50%' },
      { name: 'Number System and Divisibility', weight: 8, priority: 4, block: 'Block I 15-20%' },
      { name: 'Progressions and Series', weight: 7, priority: 5, block: 'Block I 15-20%' },
      { name: 'Algebra: Functions and Graphs', weight: 8, priority: 6, block: 'Block IV 15-30%' },
      { name: 'Algebra: Inequalities and Logarithms', weight: 7, priority: 7, block: 'Block IV 15-30%' },
      { name: 'Quadratic and Other Equations', weight: 7, priority: 8, block: 'Block IV 15-30%' },
      { name: 'Geometry and Mensuration', weight: 7, priority: 9, block: 'Block III 10-20%' },
      { name: 'Coordinate Geometry', weight: 4, priority: 10, block: 'Block III 10-20%' },
      { name: 'Permutations and Combinations', weight: 4, priority: 11, block: 'Block V 5-10%' },
      { name: 'Probability', weight: 4, priority: 12, block: 'Block V 5-10%' },
      { name: 'Set Theory', weight: 4, priority: 13, block: 'Block V 5-10%' }
    ]
  }
];

const allTopics = () => syllabus.flatMap(section =>
  section.topics.map(topic => ({
    ...topic,
    subject: section.key,
    section: section.name,
    key: `${section.key}_${topic.name}`
  }))
);

module.exports = { syllabus, allTopics };

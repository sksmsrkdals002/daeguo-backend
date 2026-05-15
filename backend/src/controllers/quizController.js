const db = require('../db');

const startQuiz = async (req, res) => {
  const { subject_id, difficulty, count = 10 } = req.query;
  const params = [];
  const where = [];
  if (subject_id) { where.push(`subject_id = $${params.push(subject_id)}`); }
  if (difficulty) { where.push(`difficulty = $${params.push(difficulty)}`); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const totalResult = await db.query(`SELECT COUNT(*) as count FROM questions ${whereStr}`, params);
  const total = Number(totalResult.rows[0].count);
  if (total === 0) return res.status(404).json({ message: '해당 조건의 문제가 없습니다. 먼저 문제를 등록해주세요.' });

  const actualCount = Math.min(Number(count), total);
  const questions = await db.query(`
    SELECT q.id, q.title, q.content, q.difficulty, q.answer, q.explanation, s.name AS subject_name
    FROM questions q JOIN subjects s ON q.subject_id = s.id
    ${whereStr} ORDER BY RANDOM() LIMIT $${params.push(actualCount)}
  `, params);

  const quizQuestions = questions.rows.map(({ answer, explanation, ...q }) => q);
  const sessionData = JSON.stringify(questions.rows.map((q) => ({ id: q.id, answer: q.answer, explanation: q.explanation })));

  const sessionResult = await db.query(
    'INSERT INTO quiz_sessions (user_id, questions_data, total_count) VALUES ($1,$2,$3) RETURNING id',
    [req.user.id, sessionData, actualCount]
  );
  res.json({ session_id: sessionResult.rows[0].id, questions: quizQuestions, total: actualCount });
};

const submitQuiz = async (req, res) => {
  const { session_id, answers } = req.body;
  if (!session_id || !answers) return res.status(400).json({ message: 'session_id와 answers가 필요합니다.' });

  const sessionResult = await db.query('SELECT * FROM quiz_sessions WHERE id = $1 AND user_id = $2', [session_id, req.user.id]);
  if (!sessionResult.rows.length) return res.status(404).json({ message: '세션을 찾을 수 없습니다.' });
  const session = sessionResult.rows[0];
  if (session.submitted) return res.status(400).json({ message: '이미 제출된 세션입니다.' });

  const questions = JSON.parse(session.questions_data);
  let correct = 0;
  const results = questions.map((q, idx) => {
    const userAnswer = (answers[idx] || '').trim();
    const isCorrect = userAnswer.toLowerCase() === q.answer.toLowerCase();
    if (isCorrect) correct++;
    return { question_id: q.id, user_answer: userAnswer, correct_answer: q.answer, explanation: q.explanation, is_correct: isCorrect };
  });

  const score = Math.round((correct / questions.length) * 100);
  await db.query('UPDATE quiz_sessions SET submitted=1, correct_count=$1, score=$2 WHERE id=$3', [correct, score, session_id]);

  const wrongOnes = results.filter((r) => !r.is_correct);
  for (const w of wrongOnes) {
    await db.query(
      'INSERT INTO wrong_answers (user_id, question_id, memo) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
      [req.user.id, w.question_id, '']
    );
  }

  const points = score >= 80 ? 10 : score >= 60 ? 5 : 2;
  await db.query('UPDATE users SET points = points + $1 WHERE id = $2', [points, req.user.id]);
  res.json({ score, correct, total: questions.length, results, points_earned: points });
};

const getHistory = async (req, res) => {
  const result = await db.query(`
    SELECT id, total_count, correct_count, score, created_at FROM quiz_sessions
    WHERE user_id = $1 AND submitted = 1 ORDER BY created_at DESC LIMIT 20
  `, [req.user.id]);
  res.json({ history: result.rows });
};

module.exports = { startQuiz, submitQuiz, getHistory };

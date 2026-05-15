const db = require('../db');

const getWrongAnswers = async (req, res) => {
  const { subject_id } = req.query;
  const params = [req.user.id];
  const where = ['wa.user_id = $1'];
  if (subject_id) { where.push(`q.subject_id = $${params.push(subject_id)}`); }

  const result = await db.query(`
    SELECT wa.id, wa.memo, wa.created_at,
      q.id AS question_id, q.title, q.content, q.answer, q.explanation, q.difficulty,
      s.name AS subject_name
    FROM wrong_answers wa JOIN questions q ON wa.question_id = q.id JOIN subjects s ON q.subject_id = s.id
    WHERE ${where.join(' AND ')} ORDER BY wa.created_at DESC
  `, params);
  res.json({ wrong_answers: result.rows });
};

const updateMemo = async (req, res) => {
  const { memo } = req.body;
  const existing = await db.query('SELECT * FROM wrong_answers WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '오답 항목을 찾을 수 없습니다.' });
  await db.query('UPDATE wrong_answers SET memo = $1 WHERE id = $2', [memo || '', req.params.id]);
  res.json({ message: '메모가 저장되었습니다.' });
};

const addWrongAnswer = async (req, res) => {
  const { question_id, memo } = req.body;
  if (!question_id) return res.status(400).json({ message: 'question_id가 필요합니다.' });

  const question = await db.query('SELECT id FROM questions WHERE id = $1', [question_id]);
  if (!question.rows.length) return res.status(404).json({ message: '문제를 찾을 수 없습니다.' });

  const existing = await db.query('SELECT id FROM wrong_answers WHERE user_id = $1 AND question_id = $2', [req.user.id, question_id]);
  if (existing.rows.length) return res.status(409).json({ message: '이미 오답노트에 있는 문제입니다.' });

  await db.query('INSERT INTO wrong_answers (user_id, question_id, memo) VALUES ($1,$2,$3)', [req.user.id, question_id, memo || '']);
  res.status(201).json({ message: '오답노트에 추가되었습니다.' });
};

const deleteWrongAnswer = async (req, res) => {
  const existing = await db.query('SELECT * FROM wrong_answers WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '오답 항목을 찾을 수 없습니다.' });
  await db.query('DELETE FROM wrong_answers WHERE id = $1', [req.params.id]);
  res.json({ message: '오답노트에서 삭제되었습니다.' });
};

module.exports = { getWrongAnswers, updateMemo, addWrongAnswer, deleteWrongAnswer };

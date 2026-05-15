const db = require('../db');

const getQuestions = async (req, res) => {
  const { subject_id, difficulty, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const where = [];
  if (subject_id) { where.push(`q.subject_id = $${params.push(subject_id)}`); }
  if (difficulty) { where.push(`q.difficulty = $${params.push(difficulty)}`); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const questions = await db.query(`
    SELECT q.*, u.username, s.name AS subject_name
    FROM questions q JOIN users u ON q.user_id = u.id JOIN subjects s ON q.subject_id = s.id
    ${whereStr} ORDER BY q.created_at DESC LIMIT $${params.push(Number(limit))} OFFSET $${params.push(Number(offset))}
  `, params);

  const countParams = params.slice(0, where.length);
  const total = await db.query(`SELECT COUNT(*) as count FROM questions q ${whereStr}`, countParams);

  res.json({ questions: questions.rows, total: Number(total.rows[0].count), page: Number(page), totalPages: Math.ceil(total.rows[0].count / limit) });
};

const getQuestion = async (req, res) => {
  const result = await db.query(`
    SELECT q.*, u.username, s.name AS subject_name
    FROM questions q JOIN users u ON q.user_id = u.id JOIN subjects s ON q.subject_id = s.id
    WHERE q.id = $1
  `, [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ message: '문제를 찾을 수 없습니다.' });
  res.json({ question: result.rows[0] });
};

const createQuestion = async (req, res) => {
  const { subject_id, title, content, answer, explanation, difficulty, image_url } = req.body;
  if (!subject_id || !title || !content || !answer)
    return res.status(400).json({ message: '과목, 제목, 내용, 정답은 필수입니다.' });

  const result = await db.query(`
    INSERT INTO questions (user_id, subject_id, title, content, answer, explanation, difficulty, image_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id
  `, [req.user.id, subject_id, title, content, answer, explanation || null, difficulty || 'medium', image_url || null]);

  const question = await db.query(`
    SELECT q.*, u.username, s.name AS subject_name
    FROM questions q JOIN users u ON q.user_id = u.id JOIN subjects s ON q.subject_id = s.id
    WHERE q.id = $1
  `, [result.rows[0].id]);

  await db.query('UPDATE users SET points = points + 5 WHERE id = $1', [req.user.id]);
  res.status(201).json({ message: '문제가 등록되었습니다.', question: question.rows[0] });
};

const updateQuestion = async (req, res) => {
  const existing = await db.query('SELECT * FROM questions WHERE id = $1', [req.params.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '문제를 찾을 수 없습니다.' });
  const question = existing.rows[0];
  if (question.user_id !== req.user.id) return res.status(403).json({ message: '수정 권한이 없습니다.' });

  const { subject_id, title, content, answer, explanation, difficulty, image_url } = req.body;
  await db.query(`
    UPDATE questions SET subject_id=$1, title=$2, content=$3, answer=$4, explanation=$5, difficulty=$6, image_url=$7, updated_at=NOW()
    WHERE id=$8
  `, [
    subject_id ?? question.subject_id, title ?? question.title, content ?? question.content,
    answer ?? question.answer, explanation ?? question.explanation, difficulty ?? question.difficulty,
    image_url !== undefined ? image_url : question.image_url, req.params.id,
  ]);

  const updated = await db.query(`
    SELECT q.*, u.username, s.name AS subject_name
    FROM questions q JOIN users u ON q.user_id = u.id JOIN subjects s ON q.subject_id = s.id
    WHERE q.id = $1
  `, [req.params.id]);
  res.json({ message: '문제가 수정되었습니다.', question: updated.rows[0] });
};

const deleteQuestion = async (req, res) => {
  const existing = await db.query('SELECT * FROM questions WHERE id = $1', [req.params.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '문제를 찾을 수 없습니다.' });
  if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });
  await db.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
  res.json({ message: '문제가 삭제되었습니다.' });
};

module.exports = { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion };

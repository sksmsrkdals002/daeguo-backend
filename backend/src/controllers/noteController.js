const db = require('../db');

const getNotes = async (req, res) => {
  const { subject_id, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const where = ['n.is_public = 1'];
  if (subject_id) { where.push(`n.subject_id = $${params.push(subject_id)}`); }
  const whereStr = 'WHERE ' + where.join(' AND ');

  const notes = await db.query(`
    SELECT n.*, u.username, s.name AS subject_name
    FROM notes n JOIN users u ON n.user_id = u.id JOIN subjects s ON n.subject_id = s.id
    ${whereStr} ORDER BY n.created_at DESC LIMIT $${params.push(Number(limit))} OFFSET $${params.push(Number(offset))}
  `, params);

  const countParams = params.slice(0, where.length - 1);
  const total = await db.query(`SELECT COUNT(*) as count FROM notes n ${whereStr}`, countParams);
  res.json({ notes: notes.rows, total: Number(total.rows[0].count), page: Number(page), totalPages: Math.ceil(total.rows[0].count / limit) });
};

const getNote = async (req, res) => {
  const result = await db.query(`
    SELECT n.*, u.username, s.name AS subject_name
    FROM notes n JOIN users u ON n.user_id = u.id JOIN subjects s ON n.subject_id = s.id
    WHERE n.id = $1
  `, [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ message: '필기를 찾을 수 없습니다.' });
  res.json({ note: result.rows[0] });
};

const createNote = async (req, res) => {
  const { subject_id, title, content, is_public } = req.body;
  if (!subject_id || !title || !content)
    return res.status(400).json({ message: '과목, 제목, 내용은 필수입니다.' });

  const result = await db.query(
    'INSERT INTO notes (user_id, subject_id, title, content, is_public) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [req.user.id, subject_id, title, content, is_public !== false ? 1 : 0]
  );
  const note = await db.query(`
    SELECT n.*, u.username, s.name AS subject_name
    FROM notes n JOIN users u ON n.user_id = u.id JOIN subjects s ON n.subject_id = s.id
    WHERE n.id = $1
  `, [result.rows[0].id]);
  await db.query('UPDATE users SET points = points + 3 WHERE id = $1', [req.user.id]);
  res.status(201).json({ message: '필기가 등록되었습니다.', note: note.rows[0] });
};

const updateNote = async (req, res) => {
  const existing = await db.query('SELECT * FROM notes WHERE id = $1', [req.params.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '필기를 찾을 수 없습니다.' });
  const note = existing.rows[0];
  if (note.user_id !== req.user.id) return res.status(403).json({ message: '수정 권한이 없습니다.' });

  const { subject_id, title, content, is_public } = req.body;
  await db.query(
    'UPDATE notes SET subject_id=$1, title=$2, content=$3, is_public=$4, updated_at=NOW() WHERE id=$5',
    [subject_id ?? note.subject_id, title ?? note.title, content ?? note.content, is_public !== undefined ? (is_public ? 1 : 0) : note.is_public, req.params.id]
  );
  const updated = await db.query(`
    SELECT n.*, u.username, s.name AS subject_name
    FROM notes n JOIN users u ON n.user_id = u.id JOIN subjects s ON n.subject_id = s.id
    WHERE n.id = $1
  `, [req.params.id]);
  res.json({ message: '필기가 수정되었습니다.', note: updated.rows[0] });
};

const deleteNote = async (req, res) => {
  const existing = await db.query('SELECT * FROM notes WHERE id = $1', [req.params.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '필기를 찾을 수 없습니다.' });
  if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });
  await db.query('DELETE FROM notes WHERE id = $1', [req.params.id]);
  res.json({ message: '필기가 삭제되었습니다.' });
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote };

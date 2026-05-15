const db = require('../db');

const getProgress = async (req, res) => {
  const { subject_id } = req.query;
  const params = [req.user.id];
  const where = ['p.user_id = $1'];
  if (subject_id) { where.push(`p.subject_id = $${params.push(subject_id)}`); }

  const result = await db.query(`
    SELECT p.*, s.name AS subject_name FROM progress p JOIN subjects s ON p.subject_id = s.id
    WHERE ${where.join(' AND ')} ORDER BY p.subject_id, p.id
  `, params);

  const grouped = {};
  result.rows.forEach((item) => {
    if (!grouped[item.subject_id]) {
      grouped[item.subject_id] = { subject_id: item.subject_id, subject_name: item.subject_name, units: [] };
    }
    grouped[item.subject_id].units.push(item);
  });

  const progress = Object.values(grouped).map((g) => {
    const total = g.units.length;
    const completed = g.units.filter((u) => u.is_completed).length;
    return { ...g, total, completed, rate: total ? Math.round((completed / total) * 100) : 0 };
  });
  res.json({ progress });
};

const addUnit = async (req, res) => {
  const { subject_id, unit_name } = req.body;
  if (!subject_id || !unit_name) return res.status(400).json({ message: '과목과 단원명은 필수입니다.' });

  const existing = await db.query('SELECT id FROM progress WHERE user_id=$1 AND subject_id=$2 AND unit_name=$3', [req.user.id, subject_id, unit_name]);
  if (existing.rows.length) return res.status(409).json({ message: '이미 존재하는 단원입니다.' });

  const result = await db.query('INSERT INTO progress (user_id, subject_id, unit_name, is_completed) VALUES ($1,$2,$3,0) RETURNING id', [req.user.id, subject_id, unit_name]);
  const unit = await db.query('SELECT p.*, s.name AS subject_name FROM progress p JOIN subjects s ON p.subject_id = s.id WHERE p.id = $1', [result.rows[0].id]);
  res.status(201).json({ message: '단원이 추가되었습니다.', unit: unit.rows[0] });
};

const toggleUnit = async (req, res) => {
  const existing = await db.query('SELECT * FROM progress WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '단원을 찾을 수 없습니다.' });
  const newStatus = existing.rows[0].is_completed ? 0 : 1;
  await db.query('UPDATE progress SET is_completed=$1, updated_at=NOW() WHERE id=$2', [newStatus, req.params.id]);
  res.json({ message: newStatus ? '완료 처리되었습니다.' : '미완료로 변경되었습니다.', is_completed: newStatus });
};

const deleteUnit = async (req, res) => {
  const existing = await db.query('SELECT * FROM progress WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '단원을 찾을 수 없습니다.' });
  await db.query('DELETE FROM progress WHERE id=$1', [req.params.id]);
  res.json({ message: '단원이 삭제되었습니다.' });
};

module.exports = { getProgress, addUnit, toggleUnit, deleteUnit };

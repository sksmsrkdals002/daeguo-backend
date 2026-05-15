const db = require('../db');

const getDdays = async (req, res) => {
  const result = await db.query("SELECT * FROM ddays WHERE user_id = $1 ORDER BY exam_date ASC", [req.user.id]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const ddays = result.rows.map((d) => {
    const exam = new Date(d.exam_date); exam.setHours(0, 0, 0, 0);
    return { ...d, dday: Math.ceil((exam - today) / (1000 * 60 * 60 * 24)) };
  });
  res.json({ ddays });
};

const createDday = async (req, res) => {
  const { title, exam_date } = req.body;
  if (!title || !exam_date) return res.status(400).json({ message: '제목과 날짜는 필수입니다.' });
  const result = await db.query('INSERT INTO ddays (user_id, title, exam_date) VALUES ($1,$2,$3) RETURNING *', [req.user.id, title, exam_date]);
  const dday = result.rows[0];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exam = new Date(dday.exam_date); exam.setHours(0, 0, 0, 0);
  res.status(201).json({ message: 'D-Day가 등록되었습니다.', dday: { ...dday, dday: Math.ceil((exam - today) / (1000 * 60 * 60 * 24)) } });
};

const deleteDday = async (req, res) => {
  const existing = await db.query('SELECT * FROM ddays WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  if (!existing.rows.length) return res.status(404).json({ message: 'D-Day를 찾을 수 없습니다.' });
  await db.query('DELETE FROM ddays WHERE id=$1', [req.params.id]);
  res.json({ message: 'D-Day가 삭제되었습니다.' });
};

const getPlans = async (req, res) => {
  const { date, month } = req.query;
  const params = [req.user.id];
  const where = ['user_id = $1'];
  if (date) {
    where.push(`plan_date = $${params.push(date)}`);
  } else if (month) {
    where.push(`TO_CHAR(plan_date::date, 'YYYY-MM') = $${params.push(month)}`);
  }
  const result = await db.query(`SELECT * FROM planner WHERE ${where.join(' AND ')} ORDER BY plan_date ASC, id ASC`, params);
  res.json({ plans: result.rows });
};

const createPlan = async (req, res) => {
  const { plan_date, content } = req.body;
  if (!plan_date || !content) return res.status(400).json({ message: '날짜와 내용은 필수입니다.' });
  const result = await db.query('INSERT INTO planner (user_id, plan_date, content, is_done) VALUES ($1,$2,$3,0) RETURNING *', [req.user.id, plan_date, content]);
  res.status(201).json({ message: '계획이 등록되었습니다.', plan: result.rows[0] });
};

const togglePlan = async (req, res) => {
  const existing = await db.query('SELECT * FROM planner WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '계획을 찾을 수 없습니다.' });
  const newStatus = existing.rows[0].is_done ? 0 : 1;
  await db.query('UPDATE planner SET is_done=$1 WHERE id=$2', [newStatus, req.params.id]);
  if (newStatus === 1) await db.query('UPDATE users SET points = points + 1 WHERE id=$1', [req.user.id]);
  res.json({ message: newStatus ? '완료!' : '미완료로 변경', is_done: newStatus });
};

const deletePlan = async (req, res) => {
  const existing = await db.query('SELECT * FROM planner WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '계획을 찾을 수 없습니다.' });
  await db.query('DELETE FROM planner WHERE id=$1', [req.params.id]);
  res.json({ message: '계획이 삭제되었습니다.' });
};

module.exports = { getDdays, createDday, deleteDday, getPlans, createPlan, togglePlan, deletePlan };

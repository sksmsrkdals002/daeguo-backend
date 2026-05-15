const db = require('../db');

const saveSession = async (req, res) => {
  const { duration_minutes } = req.body;
  if (!duration_minutes || duration_minutes < 1) return res.status(400).json({ message: '올바른 시간을 입력해주세요.' });
  await db.query('INSERT INTO pomodoro_sessions (user_id, duration_minutes) VALUES ($1,$2)', [req.user.id, duration_minutes]);
  if (duration_minutes >= 25) await db.query('UPDATE users SET points = points + 3 WHERE id = $1', [req.user.id]);
  res.status(201).json({ message: '세션이 저장되었습니다.' });
};

const getStats = async (req, res) => {
  const total = await db.query('SELECT COUNT(*) as count, SUM(duration_minutes) as total_min FROM pomodoro_sessions WHERE user_id = $1', [req.user.id]);
  const today = new Date().toISOString().slice(0, 10);
  const todayStat = await db.query("SELECT COUNT(*) as count, SUM(duration_minutes) as total_min FROM pomodoro_sessions WHERE user_id=$1 AND completed_at::date = $2::date", [req.user.id, today]);
  res.json({
    total_sessions: Number(total.rows[0].count) || 0,
    total_minutes: Number(total.rows[0].total_min) || 0,
    today_sessions: Number(todayStat.rows[0].count) || 0,
    today_minutes: Number(todayStat.rows[0].total_min) || 0,
  });
};

module.exports = { saveSession, getStats };

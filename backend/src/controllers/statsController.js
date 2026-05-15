const db = require('../db');

const getMyStats = async (req, res) => {
  const uid = req.user.id;

  const [questions, notes, qna, flashsets, wrongCnt, quizStats, pomStats, progressStats, recentQuiz, recentPomodoro, wrongBySubject, user] = await Promise.all([
    db.query('SELECT COUNT(*) as count FROM questions WHERE user_id=$1', [uid]),
    db.query('SELECT COUNT(*) as count FROM notes WHERE user_id=$1', [uid]),
    db.query('SELECT COUNT(*) as count FROM qna_posts WHERE user_id=$1', [uid]),
    db.query('SELECT COUNT(*) as count FROM flashcard_sets WHERE user_id=$1', [uid]),
    db.query('SELECT COUNT(*) as count FROM wrong_answers WHERE user_id=$1', [uid]),
    db.query('SELECT COUNT(*) as total_quizzes, AVG(score) as avg_score, MAX(score) as best_score, SUM(total_count) as total_questions, SUM(correct_count) as total_correct FROM quiz_sessions WHERE user_id=$1 AND submitted=1', [uid]),
    db.query('SELECT COUNT(*) as total_sessions, SUM(duration_minutes) as total_minutes FROM pomodoro_sessions WHERE user_id=$1', [uid]),
    db.query('SELECT COUNT(*) as total_units, SUM(is_completed) as completed_units FROM progress WHERE user_id=$1', [uid]),
    db.query("SELECT created_at::date as date, AVG(score) as avg_score, COUNT(*) as count FROM quiz_sessions WHERE user_id=$1 AND submitted=1 AND created_at >= NOW() - INTERVAL '7 days' GROUP BY created_at::date ORDER BY date ASC", [uid]),
    db.query("SELECT completed_at::date as date, SUM(duration_minutes) as total_min, COUNT(*) as sessions FROM pomodoro_sessions WHERE user_id=$1 AND completed_at >= NOW() - INTERVAL '7 days' GROUP BY completed_at::date ORDER BY date ASC", [uid]),
    db.query('SELECT s.name AS subject_name, COUNT(*) as count FROM wrong_answers wa JOIN questions q ON wa.question_id=q.id JOIN subjects s ON q.subject_id=s.id WHERE wa.user_id=$1 GROUP BY q.subject_id, s.name ORDER BY count DESC LIMIT 5', [uid]),
    db.query('SELECT points, created_at FROM users WHERE id=$1', [uid]),
  ]);

  const qs = quizStats.rows[0];
  const ps = pomStats.rows[0];
  const pg = progressStats.rows[0];

  res.json({
    overview: {
      questions: Number(questions.rows[0].count),
      notes: Number(notes.rows[0].count),
      qna: Number(qna.rows[0].count),
      flashcard_sets: Number(flashsets.rows[0].count),
      wrong_answers: Number(wrongCnt.rows[0].count),
      points: user.rows[0].points,
      joined: user.rows[0].created_at?.toISOString?.()?.slice(0, 10),
    },
    quiz: {
      total_quizzes: Number(qs.total_quizzes) || 0,
      avg_score: qs.avg_score ? Math.round(qs.avg_score) : 0,
      best_score: Number(qs.best_score) || 0,
      total_questions: Number(qs.total_questions) || 0,
      total_correct: Number(qs.total_correct) || 0,
      accuracy: qs.total_questions ? Math.round((qs.total_correct / qs.total_questions) * 100) : 0,
    },
    pomodoro: {
      total_sessions: Number(ps.total_sessions) || 0,
      total_minutes: Number(ps.total_minutes) || 0,
      total_hours: ps.total_minutes ? (ps.total_minutes / 60).toFixed(1) : '0.0',
    },
    progress: {
      total_units: Number(pg.total_units) || 0,
      completed_units: Number(pg.completed_units) || 0,
      rate: pg.total_units ? Math.round((pg.completed_units / pg.total_units) * 100) : 0,
    },
    charts: {
      recentQuiz: recentQuiz.rows,
      recentPomodoro: recentPomodoro.rows,
      wrongBySubject: wrongBySubject.rows,
    },
  });
};

const getWeeklyRanking = async (req, res) => {
  const result = await db.query(`
    SELECT u.id, u.username, u.school, u.school_type, u.grade, u.points,
      (SELECT COUNT(*) FROM quiz_sessions qs WHERE qs.user_id=u.id AND qs.submitted=1 AND qs.created_at >= NOW()-INTERVAL '7 days') AS weekly_quizzes,
      (SELECT COALESCE(SUM(ps.duration_minutes),0) FROM pomodoro_sessions ps WHERE ps.user_id=u.id AND ps.completed_at >= NOW()-INTERVAL '7 days') AS weekly_minutes,
      (SELECT COUNT(*) FROM questions q WHERE q.user_id=u.id AND q.created_at >= NOW()-INTERVAL '7 days') AS weekly_questions
    FROM users u ORDER BY u.points DESC LIMIT 20
  `);
  const myRank = result.rows.findIndex((r) => r.id === req.user.id) + 1;
  res.json({ ranking: result.rows.map((r, idx) => ({ ...r, rank: idx + 1 })), my_rank: myRank || null });
};

const getMonthlyRanking = async (req, res) => {
  const result = await db.query(`
    SELECT u.id, u.username, u.school, u.school_type, u.grade, u.points,
      (
        (SELECT COUNT(*) FROM quiz_sessions qs WHERE qs.user_id=u.id AND qs.submitted=1 AND TO_CHAR(qs.created_at,'YYYY-MM')=TO_CHAR(NOW(),'YYYY-MM'))*10
        +(SELECT COUNT(*) FROM questions q WHERE q.user_id=u.id AND TO_CHAR(q.created_at,'YYYY-MM')=TO_CHAR(NOW(),'YYYY-MM'))*5
        +(SELECT COUNT(*) FROM notes n WHERE n.user_id=u.id AND TO_CHAR(n.created_at,'YYYY-MM')=TO_CHAR(NOW(),'YYYY-MM'))*3
        +(SELECT COALESCE(SUM(ps.duration_minutes),0) FROM pomodoro_sessions ps WHERE ps.user_id=u.id AND TO_CHAR(ps.completed_at,'YYYY-MM')=TO_CHAR(NOW(),'YYYY-MM'))
      ) AS monthly_score
    FROM users u ORDER BY monthly_score DESC LIMIT 20
  `);
  const myRank = result.rows.findIndex((r) => r.id === req.user.id) + 1;
  res.json({ ranking: result.rows.map((r, idx) => ({ ...r, rank: idx + 1 })), my_rank: myRank || null });
};

module.exports = { getMyStats, getWeeklyRanking, getMonthlyRanking };

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const subjectRoutes = require('./routes/subjects');
const questionRoutes = require('./routes/questions');
const noteRoutes = require('./routes/notes');
const qnaRoutes = require('./routes/qna');
const flashcardRoutes = require('./routes/flashcards');
const quizRoutes = require('./routes/quiz');
const wrongAnswerRoutes = require('./routes/wrongAnswers');
const progressRoutes = require('./routes/progress');
const plannerRoutes = require('./routes/planner');
const pomodoroRoutes = require('./routes/pomodoro');
const statsRoutes = require('./routes/stats');

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some((o) => origin.startsWith(o.trim()))) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: '서버가 정상 작동 중입니다.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/qna', qnaRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/wrong-answers', wrongAnswerRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/stats', statsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: '요청한 경로를 찾을 수 없습니다.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
});

module.exports = app;

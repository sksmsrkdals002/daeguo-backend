const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { startQuiz, submitQuiz, getHistory } = require('../controllers/quizController');

router.get('/start', auth, startQuiz);
router.post('/submit', auth, submitQuiz);
router.get('/history', auth, getHistory);

module.exports = router;

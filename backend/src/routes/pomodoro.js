const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { saveSession, getStats } = require('../controllers/pomodoroController');

router.post('/session', auth, saveSession);
router.get('/stats', auth, getStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMyStats, getWeeklyRanking, getMonthlyRanking } = require('../controllers/statsController');

router.get('/me', auth, getMyStats);
router.get('/ranking/weekly', auth, getWeeklyRanking);
router.get('/ranking/monthly', auth, getMonthlyRanking);

module.exports = router;

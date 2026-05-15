const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getDdays, createDday, deleteDday,
  getPlans, createPlan, togglePlan, deletePlan,
} = require('../controllers/plannerController');

router.get('/ddays', auth, getDdays);
router.post('/ddays', auth, createDday);
router.delete('/ddays/:id', auth, deleteDday);

router.get('/plans', auth, getPlans);
router.post('/plans', auth, createPlan);
router.patch('/plans/:id/toggle', auth, togglePlan);
router.delete('/plans/:id', auth, deletePlan);

module.exports = router;

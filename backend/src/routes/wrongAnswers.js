const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getWrongAnswers, updateMemo, addWrongAnswer, deleteWrongAnswer } = require('../controllers/wrongAnswerController');

router.get('/', auth, getWrongAnswers);
router.post('/', auth, addWrongAnswer);
router.put('/:id/memo', auth, updateMemo);
router.delete('/:id', auth, deleteWrongAnswer);

module.exports = router;

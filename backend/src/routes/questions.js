const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');

router.get('/', getQuestions);
router.get('/:id', getQuestion);
router.post('/', auth, createQuestion);
router.put('/:id', auth, updateQuestion);
router.delete('/:id', auth, deleteQuestion);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getNotes, getNote, createNote, updateNote, deleteNote } = require('../controllers/noteController');

router.get('/', getNotes);
router.get('/:id', getNote);
router.post('/', auth, createNote);
router.put('/:id', auth, updateNote);
router.delete('/:id', auth, deleteNote);

module.exports = router;

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSets, getSet, createSet, updateSet, deleteSet } = require('../controllers/flashcardController');

router.get('/', auth, getSets);
router.get('/:id', auth, getSet);
router.post('/', auth, createSet);
router.put('/:id', auth, updateSet);
router.delete('/:id', auth, deleteSet);

module.exports = router;

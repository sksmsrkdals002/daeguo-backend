const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProgress, addUnit, toggleUnit, deleteUnit } = require('../controllers/progressController');

router.get('/', auth, getProgress);
router.post('/', auth, addUnit);
router.patch('/:id/toggle', auth, toggleUnit);
router.delete('/:id', auth, deleteUnit);

module.exports = router;

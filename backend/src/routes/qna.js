const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getPosts, getPost, createPost, deletePost, createComment, deleteComment } = require('../controllers/qnaController');

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', auth, createPost);
router.delete('/:id', auth, deletePost);
router.post('/:id/comments', auth, createComment);
router.delete('/:id/comments/:commentId', auth, deleteComment);

module.exports = router;

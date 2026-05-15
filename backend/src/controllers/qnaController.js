const db = require('../db');

const getPosts = async (req, res) => {
  const { subject_id, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const where = [];
  if (subject_id) { where.push(`q.subject_id = $${params.push(subject_id)}`); }
  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const posts = await db.query(`
    SELECT q.*, u.username, s.name AS subject_name,
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = q.id) AS comment_count
    FROM qna_posts q JOIN users u ON q.user_id = u.id JOIN subjects s ON q.subject_id = s.id
    ${whereStr} ORDER BY q.created_at DESC LIMIT $${params.push(Number(limit))} OFFSET $${params.push(Number(offset))}
  `, params);

  const countParams = params.slice(0, where.length);
  const total = await db.query(`SELECT COUNT(*) as count FROM qna_posts q ${whereStr}`, countParams);

  const masked = posts.rows.map((p) => ({ ...p, username: p.is_anonymous ? '익명' : p.username }));
  res.json({ posts: masked, total: Number(total.rows[0].count), page: Number(page), totalPages: Math.ceil(total.rows[0].count / limit) });
};

const getPost = async (req, res) => {
  const postResult = await db.query(`
    SELECT q.*, u.username, s.name AS subject_name
    FROM qna_posts q JOIN users u ON q.user_id = u.id JOIN subjects s ON q.subject_id = s.id
    WHERE q.id = $1
  `, [req.params.id]);
  if (!postResult.rows.length) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

  const comments = await db.query(`
    SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1 ORDER BY c.created_at ASC
  `, [req.params.id]);

  const post = postResult.rows[0];
  res.json({
    post: { ...post, username: post.is_anonymous ? '익명' : post.username },
    comments: comments.rows.map((c) => ({ ...c, username: c.is_anonymous ? '익명' : c.username })),
  });
};

const createPost = async (req, res) => {
  const { subject_id, title, content, is_anonymous } = req.body;
  if (!subject_id || !title || !content)
    return res.status(400).json({ message: '과목, 제목, 내용은 필수입니다.' });

  const result = await db.query(
    'INSERT INTO qna_posts (user_id, subject_id, title, content, is_anonymous) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [req.user.id, subject_id, title, content, is_anonymous ? 1 : 0]
  );
  const post = await db.query(`
    SELECT q.*, u.username, s.name AS subject_name
    FROM qna_posts q JOIN users u ON q.user_id = u.id JOIN subjects s ON q.subject_id = s.id
    WHERE q.id = $1
  `, [result.rows[0].id]);
  res.status(201).json({ message: '질문이 등록되었습니다.', post: post.rows[0] });
};

const deletePost = async (req, res) => {
  const existing = await db.query('SELECT * FROM qna_posts WHERE id = $1', [req.params.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });
  await db.query('DELETE FROM qna_posts WHERE id = $1', [req.params.id]);
  res.json({ message: '게시글이 삭제되었습니다.' });
};

const createComment = async (req, res) => {
  const { content, is_anonymous } = req.body;
  if (!content) return res.status(400).json({ message: '댓글 내용을 입력하세요.' });

  const post = await db.query('SELECT id FROM qna_posts WHERE id = $1', [req.params.id]);
  if (!post.rows.length) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

  const result = await db.query(
    'INSERT INTO comments (post_id, user_id, content, is_anonymous) VALUES ($1,$2,$3,$4) RETURNING id',
    [req.params.id, req.user.id, content, is_anonymous ? 1 : 0]
  );
  const comment = await db.query(
    'SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = $1',
    [result.rows[0].id]
  );
  await db.query('UPDATE users SET points = points + 2 WHERE id = $1', [req.user.id]);
  const c = comment.rows[0];
  res.status(201).json({ message: '댓글이 등록되었습니다.', comment: { ...c, username: c.is_anonymous ? '익명' : c.username } });
};

const deleteComment = async (req, res) => {
  const existing = await db.query('SELECT * FROM comments WHERE id = $1', [req.params.commentId]);
  if (!existing.rows.length) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
  if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });
  await db.query('DELETE FROM comments WHERE id = $1', [req.params.commentId]);
  res.json({ message: '댓글이 삭제되었습니다.' });
};

module.exports = { getPosts, getPost, createPost, deletePost, createComment, deleteComment };

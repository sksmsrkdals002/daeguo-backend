const db = require('../db');

const getSets = async (req, res) => {
  const result = await db.query(`
    SELECT fs.*, s.name AS subject_name,
      (SELECT COUNT(*) FROM flashcards f WHERE f.set_id = fs.id) AS card_count
    FROM flashcard_sets fs JOIN subjects s ON fs.subject_id = s.id
    WHERE fs.user_id = $1 ORDER BY fs.created_at DESC
  `, [req.user.id]);
  res.json({ sets: result.rows });
};

const getSet = async (req, res) => {
  const setResult = await db.query(`
    SELECT fs.*, s.name AS subject_name FROM flashcard_sets fs JOIN subjects s ON fs.subject_id = s.id WHERE fs.id = $1
  `, [req.params.id]);
  if (!setResult.rows.length) return res.status(404).json({ message: '카드 세트를 찾을 수 없습니다.' });
  const set = setResult.rows[0];
  if (set.user_id !== req.user.id) return res.status(403).json({ message: '접근 권한이 없습니다.' });

  const cards = await db.query('SELECT * FROM flashcards WHERE set_id = $1 ORDER BY order_index ASC', [req.params.id]);
  res.json({ set, cards: cards.rows });
};

const createSet = async (req, res) => {
  const { subject_id, title, cards } = req.body;
  if (!subject_id || !title) return res.status(400).json({ message: '과목과 제목은 필수입니다.' });
  if (!cards || cards.length === 0) return res.status(400).json({ message: '카드를 최소 1개 이상 추가해주세요.' });

  const setResult = await db.query(
    'INSERT INTO flashcard_sets (user_id, subject_id, title) VALUES ($1,$2,$3) RETURNING id',
    [req.user.id, subject_id, title]
  );
  const setId = setResult.rows[0].id;

  for (let i = 0; i < cards.length; i++) {
    await db.query('INSERT INTO flashcards (set_id, front, back, order_index) VALUES ($1,$2,$3,$4)', [setId, cards[i].front, cards[i].back, i]);
  }

  await db.query('UPDATE users SET points = points + 5 WHERE id = $1', [req.user.id]);

  const set = await db.query(`SELECT fs.*, s.name AS subject_name FROM flashcard_sets fs JOIN subjects s ON fs.subject_id = s.id WHERE fs.id = $1`, [setId]);
  const savedCards = await db.query('SELECT * FROM flashcards WHERE set_id = $1 ORDER BY order_index', [setId]);
  res.status(201).json({ message: '카드 세트가 생성되었습니다.', set: set.rows[0], cards: savedCards.rows });
};

const updateSet = async (req, res) => {
  const existing = await db.query('SELECT * FROM flashcard_sets WHERE id = $1', [req.params.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '카드 세트를 찾을 수 없습니다.' });
  const set = existing.rows[0];
  if (set.user_id !== req.user.id) return res.status(403).json({ message: '수정 권한이 없습니다.' });

  const { subject_id, title, cards } = req.body;
  await db.query('UPDATE flashcard_sets SET subject_id=$1, title=$2 WHERE id=$3', [subject_id ?? set.subject_id, title ?? set.title, req.params.id]);

  if (cards && cards.length > 0) {
    await db.query('DELETE FROM flashcards WHERE set_id = $1', [req.params.id]);
    for (let i = 0; i < cards.length; i++) {
      await db.query('INSERT INTO flashcards (set_id, front, back, order_index) VALUES ($1,$2,$3,$4)', [req.params.id, cards[i].front, cards[i].back, i]);
    }
  }

  const updated = await db.query(`SELECT fs.*, s.name AS subject_name FROM flashcard_sets fs JOIN subjects s ON fs.subject_id = s.id WHERE fs.id = $1`, [req.params.id]);
  const updatedCards = await db.query('SELECT * FROM flashcards WHERE set_id = $1 ORDER BY order_index', [req.params.id]);
  res.json({ message: '카드 세트가 수정되었습니다.', set: updated.rows[0], cards: updatedCards.rows });
};

const deleteSet = async (req, res) => {
  const existing = await db.query('SELECT * FROM flashcard_sets WHERE id = $1', [req.params.id]);
  if (!existing.rows.length) return res.status(404).json({ message: '카드 세트를 찾을 수 없습니다.' });
  if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ message: '삭제 권한이 없습니다.' });
  await db.query('DELETE FROM flashcard_sets WHERE id = $1', [req.params.id]);
  res.json({ message: '카드 세트가 삭제되었습니다.' });
};

module.exports = { getSets, getSet, createSet, updateSet, deleteSet };

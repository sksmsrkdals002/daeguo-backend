const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async (req, res) => {
  const { email, password, username, school, grade, school_type } = req.body;
  if (!email || !password || !username)
    return res.status(400).json({ message: '이메일, 비밀번호, 닉네임은 필수입니다.' });
  if (password.length < 6)
    return res.status(400).json({ message: '비밀번호는 6자 이상이어야 합니다.' });
  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });

    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, username, school, grade, school_type) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,email,username,school,grade,school_type,points,created_at',
      [email, password_hash, username, school || null, grade || null, school_type || null]
    );
    const user = result.rows[0];
    res.status(201).json({ message: '회원가입이 완료되었습니다.', token: generateToken(user), user });
  } catch (err) {
    console.error('회원가입 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });

    res.json({
      message: '로그인 성공',
      token: generateToken(user),
      user: { id: user.id, email: user.email, username: user.username, school: user.school, grade: user.grade, school_type: user.school_type, points: user.points },
    });
  } catch (err) {
    console.error('로그인 오류:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, username, school, grade, school_type, points, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

module.exports = { register, login, getMe };

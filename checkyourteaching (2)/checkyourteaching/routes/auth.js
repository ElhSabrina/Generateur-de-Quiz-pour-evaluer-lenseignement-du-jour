// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middlewares/auth');

// GET /register
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// POST /register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.render('auth/register', { error: 'All fields are required.' });
  }

  if (!['teacher', 'student'].includes(role)) {
    return res.render('auth/register', { error: 'Invalid role.' });
  }

  try {
    const [existing] = await db
      .promise()
      .query('SELECT id FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
      return res.render('auth/register', { error: 'Email already in use.' });
    }

    const hash = await bcrypt.hash(password, 10);

    await db
      .promise()
      .query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name, email, hash, role]
      );

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('auth/register', { error: 'Unexpected error. Please try again.' });
  }
});

// GET /login
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('auth/login', { error: 'Email and password are required.' });
  }

  try {
    const [rows] = await db
      .promise()
      .query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.render('auth/login', { error: 'Invalid credentials.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.render('auth/login', { error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    res.cookie('token', token, { httpOnly: true });

    if (user.role === 'teacher') return res.redirect('/teacher/dashboard');
    return res.redirect('/student/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { error: 'Unexpected error. Please try again.' });
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;

// routes/student.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authRequired, roleRequired } = require('../middlewares/auth');

// Protect all student routes
router.use(authRequired, roleRequired('student'));

// GET /student/dashboard
router.get('/dashboard', async (req, res) => {
  const studentId = req.user.id;

  const [attempts] = await db
    .promise()
    .query(
      `SELECT 
         qa.*, 
         q.title, 
         q.code,
         s.name AS subject_name
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       JOIN subjects s ON q.subject_id = s.id
       WHERE qa.student_id = ?
       ORDER BY qa.created_at DESC`,
      [studentId]
    );

  res.render('student/dashboard', { attempts });
});


// POST /student/join (enter quiz code)
router.post('/join', async (req, res) => {
  const studentId = req.user.id;
  const { code } = req.body;

  const [attempts] = await db
    .promise()
    .query(
      `SELECT qa.*, q.title, q.code
       FROM quiz_attempts qa
       JOIN quizzes q ON qa.quiz_id = q.id
       WHERE qa.student_id = ?
       ORDER BY qa.created_at DESC`,
      [studentId]
    );

  if (!code) {
    return res.render('student/dashboard', {
      attempts,
      error: 'Please enter a quiz code.'
    });
  }

  const [rows] = await db
    .promise()
    .query('SELECT * FROM quizzes WHERE code = ?', [code]);

  if (rows.length === 0 || rows[0].status !== 'open') {
    return res.render('student/dashboard', {
      attempts,
      error: 'Quiz not found or not open.'
    });
  }

  const quiz = rows[0];
  res.redirect(`/student/quiz/${quiz.code}`);
});

// GET /student/quiz/:code (take quiz)
router.get('/quiz/:code', async (req, res) => {
  const code = req.params.code;

  const [quizzes] = await db
    .promise()
    .query('SELECT * FROM quizzes WHERE code = ?', [code]);

  if (quizzes.length === 0) {
    return res.status(404).render('error', { message: 'Quiz not found' });
  }

  const quiz = quizzes[0];

  // If quiz is already closed, go directly to result page
  if (quiz.status === 'closed') {
    return res.redirect(`/student/quiz/${code}/result`);
  }

  const [questions] = await db
    .promise()
    .query('SELECT * FROM questions WHERE quiz_id = ?', [quiz.id]);

  res.render('student/take_quiz', { quiz, questions });
});

// POST /student/quiz/:code (submit answers)
router.post('/quiz/:code', async (req, res) => {
  const studentId = req.user.id;
  const code = req.params.code;
  const conn = db.promise();

  const [quizzes] = await conn.query('SELECT * FROM quizzes WHERE code = ?', [
    code
  ]);
  if (quizzes.length === 0) {
    return res.status(404).render('error', { message: 'Quiz not found' });
  }
  const quiz = quizzes[0];

  const [questions] = await conn.query(
    'SELECT * FROM questions WHERE quiz_id = ?',
    [quiz.id]
  );

  let score = 0;

  // Create attempt with initial score 0
  const [attemptRes] = await conn.query(
    'INSERT INTO quiz_attempts (quiz_id, student_id, score) VALUES (?, ?, 0)',
    [quiz.id, studentId]
  );
  const attemptId = attemptRes.insertId;

  for (const q of questions) {
    const selected = req.body[`q_${q.id}`];
    const isCorrect = selected === q.correct_option;
    if (isCorrect) score += 1;

    await conn.query(
      `INSERT INTO student_answers
       (attempt_id, question_id, selected_option, is_correct)
       VALUES (?, ?, ?, ?)`,
      [attemptId, q.id, selected || 'A', isCorrect ? 1 : 0]
    );
  }

  // Update attempt score (number of correct answers)
  await conn.query('UPDATE quiz_attempts SET score = ? WHERE id = ?', [
    score,
    attemptId
  ]);

  // Student will see the full correction only once the teacher closes the quiz
  res.redirect(`/student/quiz/${code}/result`);
});

// GET /student/quiz/:code/result
router.get('/quiz/:code/result', async (req, res) => {
  const studentId = req.user.id;
  const code = req.params.code;
  const conn = db.promise();

  const [quizzes] = await conn.query('SELECT * FROM quizzes WHERE code = ?', [
    code
  ]);
  if (quizzes.length === 0) {
    return res.status(404).render('error', { message: 'Quiz not found' });
  }
  const quiz = quizzes[0];

  const [attempts] = await conn.query(
    `SELECT * FROM quiz_attempts
     WHERE quiz_id = ? AND student_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [quiz.id, studentId]
  );
  if (attempts.length === 0) {
    return res.status(404).render('error', { message: 'No attempt found' });
  }
  const attempt = attempts[0];

  const [answers] = await conn.query(
    `SELECT q.id,
            q.text,
            q.option_a, q.option_b, q.option_c, q.option_d,
            q.correct_option,
            sa.selected_option, sa.is_correct
     FROM student_answers sa
     JOIN questions q ON q.id = sa.question_id
     WHERE sa.attempt_id = ?`,
    [attempt.id]
  );

  const isClosed = quiz.status === 'closed';

  // For a clear score like "7 / 10"
  const totalQuestions = answers.length;
  const correctCount = attempt.score || 0;

  res.render('student/result', {
    quiz,
    attempt,
    answers,
    isClosed,
    totalQuestions,
    correctCount
  });
});

module.exports = router;

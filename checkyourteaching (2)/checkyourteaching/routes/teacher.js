// routes/teacher.js
const express = require('express');
const router = express.Router();
const db = require('../db');

const { authRequired, roleRequired } = require('../middlewares/auth');
const { generateQuizFromText } = require('../services/ai');

// For file upload (.txt)
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Protect all teacher routes
router.use(authRequired, roleRequired('teacher'));

// GET /teacher/dashboard
router.get('/dashboard', async (req, res) => {
  const teacherId = req.user.id;

  const [subjects] = await db
    .promise()
    .query('SELECT * FROM subjects WHERE teacher_id = ?', [teacherId]);

  const [quizzes] = await db
    .promise()
    .query(
      `SELECT q.*, s.name AS subject_name
       FROM quizzes q
       JOIN subjects s ON q.subject_id = s.id
       WHERE q.teacher_id = ?
       ORDER BY q.created_at DESC`,
      [teacherId]
    );

  res.render('teacher/dashboard', { subjects, quizzes });
});

// POST /teacher/subjects (create subject)
router.post('/subjects', async (req, res) => {
  const teacherId = req.user.id;
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.redirect('/teacher/dashboard');
  }

  await db
    .promise()
    .query('INSERT INTO subjects (teacher_id, name) VALUES (?, ?)', [
      teacherId,
      name.trim()
    ]);

  res.redirect('/teacher/dashboard');
});

// GET /teacher/quizzes/new
router.get('/quizzes/new', async (req, res) => {
  const teacherId = req.user.id;
  const [subjects] = await db
    .promise()
    .query('SELECT * FROM subjects WHERE teacher_id = ?', [teacherId]);

  res.render('teacher/create_quiz', { subjects });
});

// POST /teacher/quizzes (create quiz: AI or manual)
router.post('/quizzes', upload.single('course_file'), async (req, res) => {
  const teacherId = req.user.id;
  const { subject_id, title, mode, course_text } = req.body;

  if (!subject_id || !title) {
    return res.redirect('/teacher/quizzes/new');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const conn = db.promise();

  try {
    // Get subject name for AI context
    let subjectName = '';
    const [subRows] = await conn.query(
      'SELECT name FROM subjects WHERE id = ? AND teacher_id = ?',
      [subject_id, teacherId]
    );
    if (subRows.length > 0) {
      subjectName = subRows[0].name;
    }

    const [result] = await conn.query(
      'INSERT INTO quizzes (teacher_id, subject_id, title, code, status) VALUES (?, ?, ?, ?, ?)',
      [teacherId, subject_id, title, code, 'draft']
    );
    const quizId = result.insertId;

    // AI mode: generate questions from text and/or uploaded .txt file
    if (mode === 'ai') {
      // 1) Read text from uploaded .txt file (if any)
      let fileText = '';
      if (req.file && req.file.buffer) {
        try {
          fileText = req.file.buffer.toString('utf8') || '';
          console.log('[AI] Uploaded text file length:', fileText.length);
        } catch (err) {
          console.warn('[AI] Error while reading uploaded text file:', err.message);
        }
      }

      // 2) Textarea content
      const manualText = (course_text || '').trim();

      // 3) Combine both sources
      let combinedText = '';
      if (manualText && fileText) {
        console.log('[AI] Using TEXT + uploaded .txt file content.');
        combinedText = `${manualText}\n\n---\n\n${fileText}`;
      } else if (manualText) {
        console.log('[AI] Using TEXT only.');
        combinedText = manualText;
      } else if (fileText) {
        console.log('[AI] Using uploaded .txt file only.');
        combinedText = fileText;
      }

      if (!combinedText.trim()) {
        console.warn('[AI] No usable course content (text or file). Skipping AI generation.');
        console.log(
          '[AI] Quiz stays in draft mode so the teacher can add questions manually.'
        );
        return res.redirect(`/teacher/quizzes/${quizId}/edit`);
      }

      // 4) Call Gemini once with the combined text
      const questions = await generateQuizFromText(
        combinedText,
        subjectName,
        title,
        5
      );

      console.log('[AI] Questions to insert:', questions.length);

      for (const q of questions) {
        await conn.query(
          `INSERT INTO questions
           (quiz_id, text, option_a, option_b, option_c, option_d, correct_option, topic_tag)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            quizId,
            q.text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_option,
            q.topic_tag
          ]
        );
      }

      // Keep "draft" so the teacher can review AI questions
      return res.redirect(`/teacher/quizzes/${quizId}/edit`);
    }

    // Manual mode: teacher will add questions on the edit page
    return res.redirect(`/teacher/quizzes/${quizId}/edit`);
  } catch (err) {
    console.error(err);
    res.redirect('/teacher/dashboard');
  }
});

// GET /teacher/quizzes/:id/edit
router.get('/quizzes/:id/edit', async (req, res) => {
  const teacherId = req.user.id;
  const quizId = req.params.id;

  const [quizzes] = await db
    .promise()
    .query('SELECT * FROM quizzes WHERE id = ? AND teacher_id = ?', [
      quizId,
      teacherId
    ]);

  if (quizzes.length === 0) {
    return res.status(404).render('error', { message: 'Quiz not found' });
  }

  const [questions] = await db
    .promise()
    .query('SELECT * FROM questions WHERE quiz_id = ?', [quizId]);

  res.render('teacher/edit_quiz', { quiz: quizzes[0], questions });
});

// POST /teacher/quizzes/:id/questions
router.post('/quizzes/:id/questions', async (req, res) => {
  const quizId = req.params.id;
  const { text, option_a, option_b, option_c, option_d, correct_option } =
    req.body;

  if (
    !text ||
    !option_a ||
    !option_b ||
    !option_c ||
    !option_d ||
    !correct_option
  ) {
    return res.redirect(`/teacher/quizzes/${quizId}/edit`);
  }

  await db
    .promise()
    .query(
      `INSERT INTO questions
       (quiz_id, text, option_a, option_b, option_c, option_d, correct_option)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [quizId, text, option_a, option_b, option_c, option_d, correct_option]
    );

  res.redirect(`/teacher/quizzes/${quizId}/edit`);
});

// POST /teacher/questions/:id/delete
router.post('/questions/:id/delete', async (req, res) => {
  const questionId = req.params.id;
  const { quiz_id } = req.body;

  await db.promise().query('DELETE FROM questions WHERE id = ?', [questionId]);
  res.redirect(`/teacher/quizzes/${quiz_id}/edit`);
});

// POST /teacher/quizzes/:id/open
router.post('/quizzes/:id/open', async (req, res) => {
  const quizId = req.params.id;
  await db
    .promise()
    .query('UPDATE quizzes SET status = "open" WHERE id = ?', [quizId]);
  res.redirect(`/teacher/quizzes/${quizId}/ready`);
});

// GET /teacher/quizzes/:id/ready
router.get('/quizzes/:id/ready', async (req, res) => {
  const teacherId = req.user.id;
  const quizId = req.params.id;

  const [rows] = await db
    .promise()
    .query(
      `SELECT q.*, s.name AS subject_name
       FROM quizzes q
       JOIN subjects s ON q.subject_id = s.id
       WHERE q.id = ? AND q.teacher_id = ?`,
      [quizId, teacherId]
    );

  if (rows.length === 0) {
    return res.status(404).render('error', { message: 'Quiz not found' });
  }

  const quiz = rows[0];

  // If quiz is already closed, go straight to analysis
  if (quiz.status === 'closed') {
    return res.redirect(`/teacher/quizzes/${quizId}/analysis`);
  }

  // Otherwise, show the "share this code with your students" screen
  res.render('teacher/quiz_ready', { quiz });
});


// POST /teacher/quizzes/:id/close
router.post('/quizzes/:id/close', async (req, res) => {
  const quizId = req.params.id;
  await db
    .promise()
    .query('UPDATE quizzes SET status = "closed" WHERE id = ?', [quizId]);
  res.redirect(`/teacher/quizzes/${quizId}/analysis`);
});

// GET /teacher/quizzes/:id/analysis
router.get('/quizzes/:id/analysis', async (req, res) => {
  const quizId = req.params.id;
  const conn = db.promise();

  try {
    const [avgRows] = await conn.query(
      'SELECT AVG(score) AS avg_score, COUNT(*) AS total_attempts FROM quiz_attempts WHERE quiz_id = ?',
      [quizId]
    );

    const avgScore = avgRows[0].avg_score || 0;
    const totalAttempts = avgRows[0].total_attempts || 0;

    const [questionStats] = await conn.query(
      `SELECT q.id, q.text,
              SUM(sa.is_correct) AS correct_count,
              COUNT(sa.id) AS total_answers
       FROM questions q
       LEFT JOIN student_answers sa ON sa.question_id = q.id
       LEFT JOIN quiz_attempts qa ON qa.id = sa.attempt_id
       WHERE q.quiz_id = ?
       GROUP BY q.id, q.text
       ORDER BY q.id`,
      [quizId]
    );

    const weakQuestions = questionStats.filter((q) => {
      if (!q.total_answers || q.total_answers === 0) return false;
      const ratio = q.correct_count / q.total_answers;
      return ratio < 0.6;
    });

    let recommendation = '';
    if (weakQuestions.length > 0) {
      recommendation =
        'Next class, take extra time to re-explain the concepts behind the least successful questions.';
    } else if (totalAttempts > 0) {
      recommendation =
        'Students seem comfortable with this quiz. You can move to more advanced topics.';
    } else {
      recommendation =
        'No answers yet. Ask students to complete the quiz before interpreting the results.';
    }

    res.render('teacher/quiz_analysis', {
      avgScore,
      totalAttempts,
      questionStats,
      weakQuestions,
      recommendation
    });
  } catch (err) {
    console.error(err);
    res.redirect('/teacher/dashboard');
  }
});

// POST /teacher/quizzes/:id/delete
router.post('/quizzes/:id/delete', async (req, res) => {
  const quizId = req.params.id;
  await db.promise().query('DELETE FROM quizzes WHERE id = ?', [quizId]);
  res.redirect('/teacher/dashboard');
});

module.exports = router;

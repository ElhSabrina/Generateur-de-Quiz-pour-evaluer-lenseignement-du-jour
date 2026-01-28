// app.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const { attachUser } = require('./middlewares/auth');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const teacherRouter = require('./routes/teacher');
const studentRouter = require('./routes/student');

const app = express();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(attachUser);

// Routes
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/teacher', teacherRouter);
app.use('/student', studentRouter);

// 404
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

// Start server on port from .env (3007 by default)
const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`CheckYourTeaching running on http://localhost:${PORT}`);
});

// middlewares/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'superSecretKeyChangeMe';

// Attach user to req and res.locals if a token exists
function attachUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.locals.currentUser = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // { id, name, role }
    req.user = decoded;
    res.locals.currentUser = decoded;
  } catch (err) {
    res.locals.currentUser = null;
  }
  next();
}

// Require login
function authRequired(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    res.locals.currentUser = decoded;
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
}

// Require specific role (teacher or student)
function roleRequired(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).render('error', { message: 'Access denied' });
    }
    next();
  };
}

module.exports = { attachUser, authRequired, roleRequired, JWT_SECRET };

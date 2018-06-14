const express = require('express');

const router = express.Router();

const memberHandler = require('../controllers/member');

/* GET home page. */
router.get('/', (req, res/* , next */) => {
  // The alert here won't do anything because this can only be called by express
  res.render('index', { title: 'Express', alert: req.locals.alert });
});

/* GET login page */
router.get('/login', memberHandler.getLogin);

/* POST login page */
router.post('/login', memberHandler.postLogin);

/* GET signup page */
router.get('/signup', memberHandler.getSignup);

/* POST signup page */
router.post('/signup', memberHandler.postSignup);

/* GET logout page */
router.get('/logout', memberHandler.getLogout);

module.exports = router;

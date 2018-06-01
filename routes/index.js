const express = require('express');

const router = express.Router();

const memberHandler = require('../controllers/member');

/* GET home page. */
router.get('/', (req, res/* , next */) => {
  res.status(200).render('index', { title: 'Express' });
});

/* GET login page */
router.get('/login', memberHandler.getLogin);

/* POST login page */
router.post('/login', memberHandler.postLogin);

/* GET signup page */
router.get('/signup', memberHandler.getSignup);

/* POST signup page */
router.post('/signup', memberHandler.postSignup);

module.exports = router;

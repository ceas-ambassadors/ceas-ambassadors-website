const express = require('express');

const router = express.Router();

const memberHandler = require('../controllers/member');

/* GET home page. */
router.get('/', (req, res/* , next */) => {
  res.render('index', { title: 'Express' });
});

/* GET login page */
router.get('/login', memberHandler.getLogin);

/* POST login page */
router.post('/login', memberHandler.postLogin);

module.exports = router;

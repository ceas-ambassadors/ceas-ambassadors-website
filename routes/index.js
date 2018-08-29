const express = require('express');

const router = express.Router();

const indexHandler = require('../controllers/index');
const memberHandler = require('../controllers/member');

/* GET home page. */
router.get('/', indexHandler.getIndex);

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

/* GET settings page */
router.get('/settings', memberHandler.getSettings);

/* POST change-password */
router.post('/change-password', memberHandler.postChangePassword);

/* GET apply page */
router.get('/apply', indexHandler.getApply);

/* GET virtual tour page */
router.get('/virtual-tour', indexHandler.getVirtualTour);

/* GET website reset page */
router.get('/reset', indexHandler.getReset);

module.exports = router;

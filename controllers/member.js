/**
 * This page is home to all code for controlling the member model
 */

// let models = require('../models/');
/**
 * GET for the login page
 */
exports.getLogin = (req, res) => {
  res.status(200).render('member/login', {
    title: 'Login',
  });
};

/**
 * POST for the login page
 */
exports.postLogin = (req, res) => {
  res.send('Message received.');
};

/**
 * GET for the signup page
 */
exports.getSignup = (req, res) => {
  res.status(200).render('member/signup', {
    title: 'Sign up',
  });
};

/**
 * POST for the signup page
 */
exports.postSignup = (req, res) => {
  // TODO - clean up as necessary when #5 is closed
  // TODO  - hopefully use express-validator to clean up checking for existance of variables
  const alert = {};
  alert.errorMessages = [];
  if (req.body.email === '') {
    alert.errorMessages.push('An email must be provided.');
  }
  if (req.body.email === '') {
    alert.errorMessages.push('A password must be provided.');
  }
  if (alert.errorMessages.length > 0) {
    // There was a validation error
    // TODO - when #5 is closed this needs to redirect to getSignup()!
    res.status(400).render('member/signup', { title: 'Sign up', alert: alert });
  }
  res.send(200);
};

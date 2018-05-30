/**
 * This page is home to all code for controlling the member model
 */

// let models = require('../models/');
/**
 * GET for the login page
 */
exports.getLogin = (req, res) => {
  res.send(200).render('member/login', {
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
  res.send(200).render('member/signup', {
    title: 'Sign up',
  });
};

/**
 * POST for the signup page
 */
exports.postSignup = (req, res) => {
  res.send('Message received.');
};

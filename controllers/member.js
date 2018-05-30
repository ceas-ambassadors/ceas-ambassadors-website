/**
 * This page is home to all code for controlling the member model
 */

// let models = require('../models/');
/**
 * GET for the login page
 */
exports.getLogin = (req, res) => {
  res.render('member/login', {
    title: 'Login',
  });
};

/**
 * POST for the login page
 */
exports.postLogin = (req, res) => {
  res.send('Message received.');
};

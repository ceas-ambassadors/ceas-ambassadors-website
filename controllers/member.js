/**
 * This page is home to all code for controlling the member model
 */
const { check, validationResult } = require('express-validator/check');
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
exports.postSignup = [
  check('email').isEmail().withMessage('A valid email must be provided.'),
  check('password').not().isEmpty().withMessage('A password must be provided.'),
  check('confirmPassword').not().isEmpty().withMessage('A confirmation password must be provided.'),
  (req, res) => {
    const errors = validationResult(req).formatWith(({ msg }) => { return `${msg}`; });
    if (!errors.isEmpty()) {
      // There was a validation error
      // TODO - when #5 is closed this needs to redirect to getSignup()!
      res.status(400).render('member/signup', {
        title: 'Sign up',
        alert: {
          errorMessages: errors.array(),
        },
      });
    }
    if (req.body.password !== req.body.confirmPassword) {
      // TODO - when #5 is closed this should redirect to getSignup() too
      res.status(400).render('member/signup', {
        title: 'Sign up',
        alert: {
          errorMessages: ['Passwords must match'],
        },
      });
    }


    res.send(200);
  },
];

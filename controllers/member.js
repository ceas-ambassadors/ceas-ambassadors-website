/**
 * This page is home to all code for controlling the member model
 */
const { check, validationResult } = require('express-validator/check');
const models = require('../models/');
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
  (req, res, next) => {
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

    // define handler for errors on this page
    const errorHandler = () => {
      // If the code gets this far, there was a problem with one of the sequelize calls
      // TODO - clean up once #5 is resolved
      res.status(500).render('member/signup', {
        title: 'Sign up',
        alert: {
          errorMessages: ['There was a problem. If it persists please contact the tech chair.'],
        },
      });
    };

    models.Member.findAll({
      where: {
        email: req.body.email,
      },
    }).then((members) => {
      // TODO - this is a very temporary fix to the fact
      // that as soon as you enter this promise callback req.next is undefined
      // need to research more
      req.next = next;
      // if the query returns a member then an account is already registered with that email
      // TODO - when #5 is closed this should redirect to getSignup() too
      if (members.length !== 0) {
        res.status(400).render('member/signup', {
          title: 'Sign up',
          alert: {
            errorMessages: ['An account with that email already exists'],
          },
        });
      } else {
        models.Member.generatePasswordHash(req.body.password).then((hash) => {
          models.Member.create({
            email: req.body.email,
            password: hash,
            accend: false,
            super_user: false,
            private_user: false,
          }).then(() => {
            // This is why #4 is important - it'd be real nice to show a flash on the index page
            res.status(201).redirect('/login');
          }).catch(errorHandler);
        }).catch(errorHandler);
      }
    });
  },
];

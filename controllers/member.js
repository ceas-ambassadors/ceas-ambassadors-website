/**
 * This page is home to all code for controlling the member model
 */
const { check, validationResult } = require('express-validator/check');
const models = require('../models/');
const passport = require('passport');
/**
 * GET for the login page
 */
const getLogin = (req, res) => {
  res.status(req.locals.status).render('member/login', {
    title: 'Login',
  });
};
exports.getLogin = getLogin;
/**
 * POST for the login page
 */
const postLogin = (req, res, next) => {
  passport.authenticate('local', (err, member, info) => {
    if (err) {
      return next(err);
    }
    if (!member) {
      // there was not a succesful login
      req.locals.status = 401;
      req.locals.alert.errorMessages.push(`${info.message}`);
      return getLogin(req, res, next);
    }
    return req.logIn(member, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.redirect('/');
    });
  })(req, res, next);
};
exports.postLogin = postLogin;

/**
 * GET for logout
 */
const getLogout = (req, res) => {
  req.logout();
  res.redirect('/login');
};
exports.getLogout = getLogout;

/**
 * GET for the signup page
 */
const getSignup = (req, res) => {
  res.status(req.locals.status).render('member/signup', {
    title: 'Sign up',
  });
};
exports.getSignup = getSignup;

/**
 * POST for the signup page
 */
const postSignup = [
  check('email').isEmail().withMessage('A valid email must be provided.'),
  check('password').not().isEmpty().withMessage('A password must be provided.'),
  check('confirmPassword').not().isEmpty().withMessage('A confirmation password must be provided.'),
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => { return `${msg}`; });
    if (!errors.isEmpty()) {
      // There was a validation error
      req.locals.status = 400;
      req.locals.alert.errorMessages.push(errors.array());
      // redirect to getSignup()
      return getSignup(req, res, next);
    }
    if (req.body.password !== req.body.confirmPassword) {
      // Passwords don't match - send back to signup page with error
      req.locals.status = 400;
      req.locals.alert.errorMessages.push('Passwords must match');
      return getSignup(req, res, next);
    }

    // define handler for errors on this page
    const errorHandler = (err) => {
      // If the code gets this far, there was a problem with one of the sequelize calls
      // Try and send them back to the signup page
      console.log(err);
      req.locals.status = 500;
      req.locals.alert.errorMessages.push('There was a problem. If it persists please contact the tech chair.');
      return getSignup(req, res, next);
    };

    return models.Member.findAll({
      where: {
        email: req.body.email,
      },
    }).then((members) => {
      // TODO - this is a very temporary fix to the fact
      // that as soon as you enter this promise callback req.next is undefined
      // need to research more
      req.next = next;
      // if the query returns a member then an account is already registered with that email
      if (members.length !== 0) {
        req.locals.status = 400;
        req.locals.alert.errorMessages.push('An account with that email already exists');
        return getSignup(req, res, next);
      }
      return models.Member.generatePasswordHash(req.body.password).then((hash) => {
        return models.Member.create({
          email: req.body.email,
          password: hash,
          accend: false,
          super_user: false,
          private_user: false,
        }).then((member) => {
          // TODO - this automatically returns 302 response code - 201 would be better.
          // Can be accomplished once '/' handler is a function
          // req.logIn requires use of callbacks, doesn't support promises
          return req.logIn(member, (err) => {
            if (err) return next(err);
            return res.redirect('/');
          });
        }).catch(errorHandler);
      }).catch(errorHandler);
    }).catch(errorHandler);
  },
];
exports.postSignup = postSignup;

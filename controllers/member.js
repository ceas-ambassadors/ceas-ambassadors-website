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
  if (req.user) {
    req.session.status = 400;
    req.session.alert.errorMessages.push('You are already logged in.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  }
  return res.status(res.locals.status).render('member/login', {
    title: 'Login',
  });
};
exports.getLogin = getLogin;
/**
 * POST for the login page
 */
const postLogin = (req, res, next) => {
  if (req.user) {
    req.session.status = 400;
    req.session.alert.errorMessages.push('You are already logged in.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  }
  return passport.authenticate('local', (err, member, info) => {
    if (err) {
      return next(err);
    }
    if (!member) {
      // there was not a succesful login
      res.locals.status = 401;
      res.locals.alert.errorMessages.push(`${info.message}`);
      return getLogin(req, res, next);
    }
    return req.logIn(member, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      req.session.status = 200;
      req.session.alert.successMessages.push('Signed in!');
      return req.session.save(() => {
        return res.redirect('/');
      });
    });
  })(req, res, next);
};
exports.postLogin = postLogin;

/**
 * GET for logout
 */
const getLogout = (req, res) => {
  if (req.user) {
    req.logout();
    req.session.status = 200;
    req.session.alert.successMessages.push('You have been logged out.');
  } else {
    req.session.status = 400;
    req.session.alert.errorMessages.push('You are not signed in.');
  }
  return req.session.save(() => {
    return res.redirect('/');
  });
};
exports.getLogout = getLogout;

/**
 * GET for the signup page
 */
const getSignup = (req, res) => {
  if (req.user) {
    req.session.status = 400;
    req.session.alert.errorMessages.push('You are already logged in.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  }
  return res.status(res.locals.status).render('member/signup', {
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
      res.locals.status = 400;
      // append array items as separate items in array
      res.locals.alert.errorMessages.push(...errors.array());
      // redirect to getSignup()
      return getSignup(req, res, next);
    }
    if (req.body.password !== req.body.confirmPassword) {
      // Passwords don't match - send back to signup page with error
      res.locals.status = 400;
      res.locals.alert.errorMessages.push('Passwords must match');
      return getSignup(req, res, next);
    }
    if (req.user) {
      req.session.status = 400;
      req.session.alert.errorMessages.push('You are already logged in.');
      return req.session.save(() => {
        return res.redirect('/');
      });
    }

    // define handler for errors on this page
    const errorHandler = (err) => {
      // If the code gets this far, there was a problem with one of the sequelize calls
      // Try and send them back to the signup page
      console.log(err);
      res.locals.status = 500;
      res.locals.alert.errorMessages.push('There was a problem. If it persists please contact the tech chair.');
      return getSignup(req, res, next);
    };

    return models.Member.findAll({
      where: {
        email: req.body.email,
      },
    }).then((members) => {
      // if the query returns a member then an account is already registered with that email
      if (members.length !== 0) {
        res.locals.status = 400;
        res.locals.alert.errorMessages.push('An account with that email already exists');
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
          // req.logIn requires use of callbacks, doesn't support promises
          return req.logIn(member, (err) => {
            if (err) return next(err);
            req.session.status = 201;
            req.session.alert.successMessages.push('Account created!');
            return req.session.save(() => {
              return res.redirect('/');
            });
          });
        }).catch(errorHandler);
      }).catch(errorHandler);
    }).catch(errorHandler);
  },
];
exports.postSignup = postSignup;

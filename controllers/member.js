/**
 * This page is home to all code for controlling the member model
 */
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');
const models = require('../models/');
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

/**
 * POST change-password
 * This endpoint is accessed via the /settings endpoint, so there is no GET
 */
const postChangePassword = [
  check('currentPassword').not().isEmpty().withMessage('Current password must be provided'),
  check('newPassword').not().isEmpty().withMessage('The new password must be provided.'),
  check('repeatNewPassword').not().isEmpty().withMessage('The new password must be repeated.'),
  (req, res) => {
    // Ensure there is a user signed in
    if (!req.user) {
      req.session.status = 401;
      req.session.alert.errorMessages.push('You must be signed in to change your password.');
      return req.session.save(() => {
        return res.redirect('/');
      });
    }
    const errors = validationResult(req).formatWith(({ msg }) => { return `${msg}`; });
    if (!errors.isEmpty()) {
      // There was a validation error
      req.session.status = 400;
      // append array items as separate items in array
      req.session.alert.errorMessages.push(...errors.array());
      // redirect to getSignup()
      return req.session.save(() => {
        return res.redirect('/settings');
      });
    }

    // new password must match repeated new password
    if (req.body.newPassword !== req.body.repeatNewPassword) {
      req.session.status = 400;
      req.session.alert.errorMessages.push('New passwords must match.');
      return req.session.save(() => {
        return res.redirect('/settings');
      });
    }

    // Generate hash of new password
    const newPasswordPromise = models.Member.generatePasswordHash(req.body.newPassword);

    // Ensure that the existing user password matches the inputted one
    const passComparePromise = models.Member.comparePassword(req.body.currentPassword, req.user);

    // use Promise.all so that the promises can resolve without dependency
    return Promise.all([newPasswordPromise, passComparePromise]).then((output) => {
      // output[0] => output of newPasswordPromise
      // output[1] => output of passComparePromise
      if (output[1] === true) {
        // the passwords matched so update the member db entry
        return req.user.update({
          password: output[0],
        }).then(() => {
          req.session.alert.successMessages.push('Password changed!');
          return req.session.save(() => {
            return res.redirect('/settings');
          });
        }).catch((err) => {
          console.log(err);
          req.session.alert.errorMessages('There was a problem. Please alert the tech chair if it continues.');
          req.session.status = 500;
          return req.session.save(() => {
            return res.redirect('/settings');
          });
        });
      }
      // the passwords did not match
      req.session.status = 400;
      req.session.alert.errorMessages.push('The current password did not match the saved password.');
      return req.session.save(() => {
        return res.redirect('/settings');
      });
    });
  },
];
exports.postChangePassword = postChangePassword;

/**
 * Render the settings page
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const getSettings = (req, res) => {
  // Ensure there is a user signed in
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be signed in to view settings.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  }
  return res.status(res.locals.status).render('member/settings', {
    title: 'Settings',
  });
};
exports.getSettings = getSettings;

/**
 *
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const postProfileUpdate = (req, res) => {
  // Ensure there is a user signed in
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be signed in to publish profile changes.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  }
  // Convert accend checkbox to bool
  let accend = false;
  if (req.body.accend === 'on') {
    accend = true;
  }
  // Take any changes submitted as the whole truth - no verification needed.
  return req.user.update({
    first_name: req.body.firstName,
    last_name: req.body.lastName,
    major: req.body.major,
    grad_year: req.body.gradYear,
    clubs: req.body.clubs,
    minors: req.body.minors,
    accend, // shorthand for accend: accend,
    hometown: req.body.hometown,
    coops: req.body.coops,
  }).then(() => {
    req.session.status = 200;
    req.session.alert.successMessages.push('Profile updated!');
    return req.session.save(() => {
      return res.redirect('/settings');
    });
  }).catch((err) => {
    console.log(err);
    req.session.alert.errorMessages('There was a problem. Please alert the tech chair if it continues.');
    req.session.status = 500;
    return req.session.save(() => {
      return res.redirect('/settings');
    });
  });
};
exports.postProfileUpdate = postProfileUpdate;

/**
 * GET profile of user specified in param `email`
 * @param {*} req - incoming request
 * @param {*} res - outgoing repsonse
 */
const getProfile = (req, res) => {
  if (!req.params.email) {
    // If the req.params.email isn't specified, this endpoint isn't hit.
    // Leaving this just in case
    req.session.status = 400;
    req.session.alert.errorMessages.push('Incomplete URL');
    // TODO - redirect to members list
    return req.session.save(() => {
      res.redirect('/');
    });
  }

  return models.Member.findAll({
    where: {
      email: req.params.email,
    },
  }).then((members) => {
    if (members.length !== 1) {
      res.locals.status = 404;
      res.locals.alert.errorMessages.push('Member not found.');
      // TODO - build 404 page
      return res.status(res.locals.status).render('index', { title: 'Not Found' });
      // return res.render('404', {
      //   title: 'Not Found',
      // });
    }
    const member = members[0]; // only one member should be returned anyways

    // render hours only if the user is looking at their own page
    // or the current user is a super user
    const renderHours = ((req.user) && (req.user.super_user || req.user.email === member.email));
    const service = member.minutes / 3600000;
    const serviceNotNeeded = member.minutes_not_needed / 3600000;
    // render their profile page
    return res.render('member/profile', {
      title: `${member.first_name} ${member.last_name}`,
      member, // shorthand for member: member,
      renderHours,
      service,
      meetings: member.meetings,
      serviceNotNeeded,
    });
  }).catch((err) => {
    console.log(err);
    req.session.status = 500;
    req.session.alert.errorMessages.push('There was an error. Please contact the tech chair if it persists.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  });
};
exports.getProfile = getProfile;

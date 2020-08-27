/**
 * This page is home to all code for controlling the member model
 */
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');
const multer = require('multer');
const fs = require('fs');
const models = require('../models/');

const pictureUpload = multer({
  dest: 'public/images/profile/',
  limits: {
    fileSize: 5000000, // 5 MB
    files: 1,
  },
}).single('picture');

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
  // logged in users cannot login again
  if (req.user) {
    req.session.status = 400;
    req.session.alert.errorMessages.push('You are already logged in.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  }
  // try to authenticate
  return passport.authenticate('local', (err, member, info) => {
    // there was an error - pass it onto the next middleware
    if (err) {
      return next(err);
    }
    if (!member) {
      // there was not a succesful login
      req.session.status = 401;
      req.session.alert.errorMessages.push(`${info.message}`);
      return req.session.save(() => {
        return res.redirect('/login');
      });
    }
    // create a session for the member
    // requires a callback - passport doesn't believe in promises at time of writing
    return req.logIn(member, (loginErr) => {
      // pass login error to next middleware
      if (loginErr) {
        return next(loginErr);
      }
      // success logging in!
      req.session.status = 200;
      req.session.alert.successMessages.push('Signed in!');
      // Check to see if there are any messages for the user
      // could be turned into it's own function if this logic gets too complex
      if (member.major === null || member.grad_year === null || member.hometown === null) {
        req.session.alert.infoMessages.push('You can add details to your profile by clicking your email in the top right of the page.');
      }
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
  check('firstName').not().isEmpty().withMessage('A first name must be provided.'),
  check('lastName').not().isEmpty().withMessage('A last name must be provided.'),
  check('password').not().isEmpty().withMessage('A password must be provided.'),
  check('confirmPassword').not().isEmpty().withMessage('A confirmation password must be provided.'),
  (req, res, next) => {
    const errors = validationResult(req).formatWith(({ msg }) => { return `${msg}`; });
    if (!errors.isEmpty()) {
      // There was a validation error
      req.session.status = 400;
      // append array items as separate items in array
      req.session.alert.errorMessages.push(...errors.array());
      // redirect to getSignup()
      return req.session.save(() => {
        return res.redirect('/signup');
      });
    }
    if (req.body.password !== req.body.confirmPassword) {
      // Passwords don't match - send back to signup page with error
      req.session.status = 400;
      req.session.alert.errorMessages.push('Passwords must match');
      return req.session.save(() => {
        return res.redirect('/signup');
      });
    }

    // assert that it is a UC email
    if (!req.body.email.endsWith('uc.edu')) {
      req.session.status = 400;
      req.session.alert.errorMessages.push('Please sign up with a uc.edu email address.');
      return req.session.save(() => {
        return res.redirect('/signup');
      });
    }

    if (req.user) {
      req.session.status = 400;
      req.session.alert.errorMessages.push('You are already logged in.');
      return req.session.save(() => {
        return res.redirect('/');
      });
    }

    return models.Member.findOne({
      where: {
        email: req.body.email,
      },
    }).then((member) => {
      // if the query returns a member then an account is already registered with that email
      if (member) {
        req.session.status = 400;
        req.session.alert.errorMessages.push('An account with that email already exists');
        return req.session.save(() => {
          return res.redirect('/signup');
        });
      }
      return models.Member.generatePasswordHash(req.body.password).then((hash) => {
        return models.Member.create({
          email: req.body.email,
          password: hash,
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          accend: false,
          super_user: false,
          private_user: false,
        }).then((newMember) => {
          // req.logIn requires use of callbacks, doesn't support promises
          return req.logIn(newMember, (err) => {
            if (err) return next(err);
            req.session.status = 201;
            req.session.alert.successMessages.push('Account created!');
            return req.session.save(() => {
              return res.redirect('/');
            });
          });
        });
      });
    }).catch(next);
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
  (req, res, next) => {
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
        }).catch(next);
      }
      // the passwords did not match
      req.session.status = 400;
      req.session.alert.errorMessages.push('The current password did not match the saved password.');
      return req.session.save(() => {
        return res.redirect('/settings');
      });
    }).catch(next);
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
 * @param {*} req - incoming requeest
 * @param {*} res - outgoing response
 */
const postProfileUpdate = (req, res, next) => {
  // Ensure there is a user signed in
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be signed in to publish profile changes.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  }

  // upload the picture
  // this wont fail if no picture is selected
  return pictureUpload(req, res, (uploadErr) => {
    if (uploadErr) {
      // there was an error uploading the picture
      req.session.status = 400;
      req.session.alert.errorMessages.push(`Error uploading: ${uploadErr}`);
      return req.session.save(() => {
        return res.redirect('/settings');
      });
    }
    // File uploading succeeded or wasn't needed
    // default to old path - it will be null or a valid path
    let file = req.user.path_to_picture;
    if (req.file) {
      // remove '/public/ from path
      file = req.file.path.split('/').slice(1, 4).join('/');
      if (req.user.path_to_picture && fs.existsSync(`public/${req.user.path_to_picture}`)) {
        // delete the old file
        // add public back to the path
        fs.unlink(`public/${req.user.path_to_picture}`, err => {
          if(err) {
            req.session.alert.errorMessages.push(`Error deleting old picture: ${err}`);
            return req.session.save(() => {
              return res.redirect('/settings');
            });
          }
        });
      }
    }
    // Convert accend checkbox to bool
    let accend = false;
    if (req.body.accend === 'on') {
      accend = true;
    }

    // Ensure that gradYear is a number
    // correct syntax for let gradYear = req.body.gradYear;
    let { gradYear } = req.body;
    if (gradYear !== null && Number(gradYear) === 0) {
      gradYear = null;
    }
    // Take any changes submitted as the whole truth - no verification needed.
    return req.user.update({
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      major: req.body.major,
      grad_year: gradYear,
      clubs: req.body.clubs,
      minors: req.body.minors,
      accend, // shorthand for accend: accend,
      hometown: req.body.hometown,
      coops: req.body.coops,
      path_to_picture: file,
    }).then(() => {
      console.log( 'here' );
      req.session.status = 200;
      req.session.alert.successMessages.push('Profile updated!');
      return req.session.save(() => {
        return res.redirect('/settings');
      });
    });
  });
};
exports.postProfileUpdate = postProfileUpdate;

/**
 * GET profile of user specified in param `email`
 * @param {*} req - incoming request
 * @param {*} res - outgoing repsonse
 */
const getProfile = (req, res, next) => {
  // Get a list of members who are signed up with some status for this event
  // It's faster to run a raw sql query than it is to run two queries in a row
  // This is because Sequelize can't do joins
  // output will be normal event object + status of said event for this member
  // http://docs.sequelizejs.com/manual/tutorial/raw-queries.html
  const eventPromise = models.sequelize.query(`SELECT Events.*, Attendances.status
                                 FROM Events INNER JOIN Attendances
                                 ON Events.id = Attendances.event_id WHERE
                                 Attendances.member_id = :memberId`, {
    replacements: {
      memberId: req.params.id,
    },
    type: models.sequelize.QueryTypes.SELECT,
  });

  const memberPromise = models.Member.findByPk(req.params.id);

  return Promise.all([memberPromise, eventPromise]).then(([member, events]) => {
    if (!member) {
      req.session.status = 404;
      req.session.alert.errorMessages.push('Member not found.');
      return req.session.save(() => {
        return res.redirect('/member');
      });
    }

    // Don't render private members for anyone but super users or that user
    // TODO - this is information leakage - should it 404?
    if (member.private_user === true
        && (!req.user || (!req.user.super_user && req.user.email !== member.email))) {
      req.session.status = 403;
      req.session.alert.errorMessages.push('You cannot view this private member.');
      return req.session.save(() => {
        return res.redirect('/');
        // TODO - return member list
        // return res.redirect('/member');
      });
    }

    const service = member.service / 3600000;
    const serviceNotNeeded = member.service_not_needed / 3600000;

    // separate events into buckets
    const unconfirmedEvents = [];
    const confirmedEvents = [];
    const notNeededEvents = [];
    const unconfirmedMeetings = [];
    const confirmedMeetings = [];
    for (let i = 0; i < events.length; i += 1) {
      if (events[i].status === models.Attendance.getStatusUnconfirmed()) {
        if (events[i].meeting) {
          unconfirmedMeetings.push(events[i]);
        } else {
          unconfirmedEvents.push(events[i]);
        }
      } else if (events[i].status === models.Attendance.getStatusConfirmed()) {
        if (events[i].meeting) {
          confirmedMeetings.push(events[i]);
        } else {
          confirmedEvents.push(events[i]);
        }
      } else if (events[i].status === models.Attendance.getStatusNotNeeded()) {
        // not a valid status for meetings
        notNeededEvents.push(events[i]);
      }
    }

    // Add notice above private users
    if (member.private_user) {
      res.locals.alert.infoMessages.push('This member is private. They are only visible to themselves and super users.');
    }

    // render their profile page
    return res.status(res.locals.status).render('member/profile', {
      title: `${member.first_name} ${member.last_name}`,
      member, // shorthand for member: member,
      service,
      meetings: member.meetings,
      serviceNotNeeded,
      unconfirmedEvents,
      confirmedEvents,
      notNeededEvents,
      unconfirmedMeetings,
      confirmedMeetings,
    });
  }).catch(next);
};
exports.getProfile = getProfile;

/**
 * GET for '/member' - renders list of members
 * @param {*} req - incoming request
 * @param {*} res - outgoing request
 */
const getList = (req, res, next) => {
  // create as variable to allow for modifying of search
  const memberWhere = {
    private_user: false,
  };
  if (req.user && req.user.super_user) {
    // super users can see private users
    delete memberWhere.private_user;
  }
  // get all member alphabetically sorted and return them
  return models.Member.findAll({
    where: memberWhere,
    order: [
      ['last_name', 'ASC'],
      ['first_name', 'ASC'],
    ],
  }).then((members) => {
    return res.status(res.locals.status).render('member/list', {
      title: 'Members',
      members, // shorthand for members: members,
    });
  }).catch(next);
};
exports.getList = getList;

/**
 * POST for updating member attributes
 * @param {*} req incoming request
 * @param {*} res outgoing response
 */
const postUpdateAttributes = (req, res, next) => {
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be signed in to modify attributes.');
    return req.session.save(() => {
      return res.redirect(`/member/${req.params.id}`);
    });
  }
  // assert that the user is a super user
  if (req.user.super_user !== true) {
    req.session.status = 403;
    req.session.alert.errorMessages.push('You must be a super user to modify attributes.');
    return req.session.save(() => {
      return res.redirect(`/member/${req.params.id}`);
    });
  }
  // get the requested member
  return models.Member.findByPk(req.params.id).then((member) => {
    if (!member) {
      // member not found, 404
      req.session.status = 404;
      req.session.alert.errorMessages.push('Member not found.');
      return req.session.save(() => {
        return res.redirect('/member/');
      });
    }
    let superUser = req.query.super_user;
    let privateUser = req.query.private_user;
    // variable to indicate that something was changed
    let change = false;
    if (superUser === 'true') {
      superUser = true;
    } else if (superUser === 'false') {
      superUser = false;
    } else {
      // wasn't true or false, set to current value
      superUser = member.super_user;
    }
    if (superUser !== member.super_user) {
      change = true;
    }
    if (privateUser === 'true') {
      privateUser = true;
    } else if (privateUser === 'false') {
      privateUser = false;
    } else {
      // wasn't tyure or false, set to current value
      privateUser = member.private_user;
    }
    if (change === false && privateUser !== member.private_user) {
      change = true;
    }
    return member.update({
      super_user: superUser,
      private_user: privateUser,
    }).then(() => {
      if (change === true) {
        req.session.status = 200;
        req.session.alert.successMessages.push('Changes made.');
      } else {
        req.session.status = 304;
        req.session.alert.infoMessages.push('No changes applied.');
      }
      return req.session.save(() => {
        return res.redirect(`/member/${req.params.id}`);
      });
    });
  }).catch(next);
};
exports.postUpdateAttributes = postUpdateAttributes;

const postDelete = (req, res, next) => {
  // Make sure the user is signed in
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to delete a member.');
    return req.session.save(() => {
      return res.redirect(`/member/${req.params.id}`);
    });
  }

  // Make sure the user is a super user
  if (!req.user.super_user) {
    req.session.status = 403;
    req.session.alert.errorMessages.push('You must be a super user to delete a member.');
    return req.session.save(() => {
      return res.redirect(`/member/${req.params.id}`);
    });
  }

  // Get the member
  return models.Member.findByPk(req.params.id).then((member) => {
    if (!member) {
      req.session.status = 404;
      req.session.alert.errorMessages.push('Member not found.');
      return req.session.save(() => {
        return res.redirect('/member');
      });
    }

    // Delete all relevant attendance records
    return models.Attendance.destroy({
      where: {
        member_id: req.params.id,
      },
    }).then(() => {
      return member.destroy().then(() => {
        req.session.alert.successMessages.push('Member succesfully deleted.');
        return req.session.save(() => {
          return res.redirect('/member');
        });
      });
    });
  }).catch(next);
};
exports.postDelete = postDelete;

/**
 * This is a temporary fix to the problem of password resetting.
 * Password reseting is difficult, because it requires email integration
 * At the time of writing, I'm in a rush to move this website to production, so the temporary
 * solution is as follows:
 * This endpoint is accessbile only by super users, who can reset member passwords to a random
 * string. Members can then login using that password, and update their password themselves.
 * Almost all of the logic here will need rewritten for actual password resetting
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const postResetPassword = (req, res, next) => {
  // Must be logged in to post reset password
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be a logged in to trigger a password reset.');
    return req.session.save(() => {
      return res.redirect(`/member/${req.params.id}`);
    });
  }

  // Must be a super user to trigger a password reset
  if (!req.user.super_user) {
    req.session.status = 403;
    req.session.alert.errorMessages.push('You must be a super user to trigger a password reset.');
    return req.session.save(() => {
      return res.redirect(`/member/${req.params.id}`);
    });
  }

  // randomly generate password
  const password = Math.random().toString(36).substr(2, 8);
  // Find the member
  const memberPromise = models.Member.findByPk(req.params.id);

  const passwordPromise = models.Member.generatePasswordHash(password);

  return Promise.all([memberPromise, passwordPromise]).then(([member, passwordHash]) => {
    if (!member) {
      req.session.status = 404;
      req.session.alert.errorMessages.push('Member not found');
      req.session.save(() => {
        return res.redirect('/member');
      });
    }

    return member.update({
      password: passwordHash,
    }).then(() => {
      req.session.alert.successMessages.push('Password succesfully reset.');
      req.session.alert.infoMessages.push(`The new password is: ${password}`);
      req.session.alert.infoMessages.push('The password can be updated on the settings page.');
      return req.session.save(() => {
        return res.redirect(`/member/${req.params.id}`);
      });
    });
  }).catch(next);
};
exports.postResetPassword = postResetPassword;

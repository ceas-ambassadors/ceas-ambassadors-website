/**
 * This page is home to all code for controlling routes that
 * don't make sense to handle somewhere else
 */
// const { check, validationResult } = require('express-validator/check');
const sequelizeOp = require('sequelize').Op;
const models = require('../models/');

const getIndex = (req, res, next) => {
  /**
   *  if the server is recovering from an error, don't do any database operations.
   *  Just show the error - that way there won't be an ifinite loop of errors if it's db or homepage
   * related.
   */
  if (res.locals.status === 500) {
    return res.status(res.locals.status).render('index', {
      title: 'Ceas Ambassadors',
    });
  }

  const eventPromise = models.Event.findAll({
    where: {
      public: true,
      meeting: false,
      end_time: {
        [sequelizeOp.gte]: Date.now(),
      },
    },
    order: [
      ['start_time', 'ASC'],
    ],
    limit: 5,
  });

  const meetingPromise = models.Event.findAll({
    where: {
      meeting: true,
      public: true,
      end_time: {
        [sequelizeOp.gte]: Date.now(),
      },
    },
    order: [
      ['start_time', 'ASC'],
    ],
    limit: 1,
  });

  // TODO - also check that they have a picture
  const memberPromise = models.Member.findAll({
    where: {
      first_name: {
        [sequelizeOp.ne]: null,
      },
      last_name: {
        [sequelizeOp.ne]: null,
      },
      major: {
        [sequelizeOp.ne]: null,
      },
      grad_year: {
        [sequelizeOp.ne]: null,
      },
      coops: {
        [sequelizeOp.ne]: null,
      },
      private_user: false,
    },
  });

  return Promise.all([eventPromise, meetingPromise, memberPromise]).then((output) => {
    const events = output[0];
    const meetings = output[1];
    const members = output[2];
    const featuredMembers = [];
    if (members.length > 0) {
      featuredMembers.push(members[Math.floor(Math.random() * members.length)]);
    }
    return res.status(res.locals.status).render('index', {
      title: 'CEAS Ambassadors',
      events, // shorthand for events: events
      meetings,
      featuredMembers,
    });
  }).catch(next);
};
exports.getIndex = getIndex;

const getApply = (req, res) => {
  return res.status(res.locals.status).render('apply', {
    title: 'Apply to CEAS Ambassadors',
  });
};
exports.getApply = getApply;

const getVirtualTour = (req, res) => {
  return res.status(res.locals.status).render('virtual-tour', {
    title: 'CEAS Virtual Tour',
  });
};
exports.getVirtualTour = getVirtualTour;

const getTraining = (req, res) => {
  // Must be logged in to visit training page
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to view the training page.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  }

  return res.status(res.locals.status).render('training', {
    title: 'Training Materials',
  });
};
exports.getTraining = getTraining;

const getReset = (req, res) => {
  // Must be logged in to visit reset page
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be a logged in to view the reset page.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  }

  // Must be a super user to visit the reset page.
  if (!req.user.super_user) {
    req.session.status = 403;
    req.session.alert.errorMessages.push('You must be a super user to view the reset page.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  }

  return res.status(res.locals.status).render('reset', {
    title: 'Reset Website',
  });
};
exports.getReset = getReset;

const postReset = (req, res, next) => {
  // Must be logged in to trigger reset
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be a logged in trigger a reset.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  }

  // Must be a super user to trigger a reset
  if (!req.user.super_user) {
    req.session.status = 403;
    req.session.alert.errorMessages.push('You must be a super user to trigger a reset.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  }

  // check that the reset key is defined
  if (!('RESET_KEY' in process.env) || typeof process.env.RESET_KEY === 'undefined') {
    req.session.status = 500;
    req.session.alert.errorMessages.push('There is no reset key defined. Please ask the technology chair to set one.');
    return req.session.save(() => {
      return res.redirect('/reset');
    });
  }
  // Check that the supplied password matches the password defined in the environment variables
  if (process.env.RESET_KEY !== req.body.password) {
    req.session.status = 400;
    req.session.alert.errorMessages.push('Incorrect reset key. Please ask the technology chair for the reset key.');
    return req.session.save(() => {
      return res.redirect('/reset');
    });
  }
  // from here on out everything is good to go - trigger a reset
  // delete all events - which will cascade to attendances
  // then update all member summation columns to 0 in case they weren't zero
  return models.Event.destroy({
    where: {},
  }).then(() => {
    // Ensure that all members summation columns are set to zero
    return models.Member.update({
      service: 0,
      meetings: 0,
      service_not_needed: 0,
    }, {
      where: {},
    }).then(() => {
      req.session.alert.successMessages.push('The website was succesfully reset!');
      return req.session.save(() => {
        return res.redirect('/');
      });
    });
  }).catch(next);
};
exports.postReset = postReset;

// const getTraining // new training material

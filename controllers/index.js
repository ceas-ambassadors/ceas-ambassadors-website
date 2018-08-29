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

const getReset = (req, res) => {
  // Must be logged in to visit reset page
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be a logged in view the reset page.');
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

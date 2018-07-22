/**
 * This page is home to all code for controlling routes that
 * don't make sense to handle somewhere else
 */
// const { check, validationResult } = require('express-validator/check');
const sequelizeOp = require('sequelize').Op;
const models = require('../models/');

const getIndex = (req, res) => {
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
      hometown: {
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
    let member = null;
    if (members.length > 0) {
      member = members[Math.floor(Math.random() * members.length)];
    }
    return res.status(res.locals.status).render('index', {
      title: 'CEAS Ambassadors',
      events, // shorthand for events: events
      meetings,
      member,
    });
  }).catch((err) => {
    console.log(err);
    req.session.status = 500;
    req.session.alert.errorMessages.push('Error. Contact the tech chair if it persists.');
    return res.session.save(() => {
      return res.redirect('/');
    });
  });
};
exports.getIndex = getIndex;

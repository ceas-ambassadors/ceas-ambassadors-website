/**
 * Controller for all event related endpoints
 */
const { check, validationResult } = require('express-validator/check');
const models = require('../models/');

/**
 * GET for the create event page
 */
const getCreate = (req, res) => {
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to create an event.');
    // TODO - redirect to event page
    return req.session.save(() => {
      return res.redirect('/');
    });
  }
  // TODO - check that user is a super user
  return res.status(res.locals.status).render('event/create', {
    title: 'Create Event',
  });
};
exports.getCreate = getCreate;

/**
 * POST for the create event page
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const postCreate = [
  check('title').not().isEmpty().withMessage('A title must be set.'),
  check('startTime').not().isEmpty().withMessage('A start time must be supplied.'),
  check('endTime').not().isEmpty().withMessage('An end time must be supplied.'),
  check('location').not().isEmpty().withMessage('A location must be set.'),
  (req, res, next) => {
    // Ensure a user is making the request
    // TODO: make sure it is a super user
    if (!req.user) {
      req.session.status = 401;
      req.session.alert.errorMessages.push('You must be logged in to create an event.');
      // TODO - redirect to event page
      return req.session.save(() => {
        return res.redirect('/');
      });
    }

    const errors = validationResult(req).formatWith(({ msg }) => { return `${msg}`; });
    if (!errors.isEmpty()) {
      // There was a validation error
      res.locals.status = 400;
      res.locals.alert.errorMessages.push(errors.array());
      // render create page
      return getCreate(req, res, next);
    }

    // Convert string times to Date objects
    const startTime = Date.parse(req.body.startTime);
    const endTime = Date.parse(req.body.endTime);

    // check for invalid start/end times
    if (Number.isNaN(startTime) || Number.isNaN(endTime) || startTime > endTime) {
      if (Number.isNaN(startTime)) {
        res.locals.alert.errorMessages.push('The start time is not a valid time.');
      }
      if (Number.isNaN(endTime)) {
        res.locals.alert.errorMessages.push('The end time is not a valid time.');
      }
      if (startTime >= endTime && Number.isNaN(startTime) && Number.isNaN(endTime)) {
        res.locals.alert.errorMessages.push('The start time must be before the end time.');
      }
      res.locals.status = 400;
      return getCreate(req, res, next);
    }

    // handle isPublic and isMeeting flags
    let isPublic = false;
    let isMeeting = false;
    if (req.body.isPublic === 'on') {
      isPublic = true;
    }
    if (req.body.isMeeting === 'on') {
      isMeeting = true;
    }

    console.log(req.body);
    // create the event
    return models.Event.create({
      title: req.body.title,
      start_time: startTime,
      end_time: endTime,
      description: req.body.description,
      location: req.body.location,
      public: isPublic,
      meeting: isMeeting,
      created_by: req.user.email,
    }).then(() => {
      // the event was succesfully created!
      req.session.status = 201;
      req.session.alert.successMessages.push('Event created!');
      return req.session.save(() => {
        // TODO: redirect to events listing page
        return res.redirect('/');
      });
    }).catch((err) => {
      // There was an error
      console.log(err);
      res.locals.status = 500;
      res.locals.alert.errorMessages.push('There was a problem. Please contact the tech chair if it persists.');
      return getCreate(req, res, next);
    });
  },
];
exports.postCreate = postCreate;

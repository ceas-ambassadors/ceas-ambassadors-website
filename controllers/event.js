/**
 * Controller for all event related endpoints
 */
const { check, validationResult } = require('express-validator/check');
const models = require('../models/');


/**
 * Get details page for a specific event specified in req.params.id
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const getDetails = (req, res) => {
  models.Event.findAll({
    where: {
      id: req.params.id,
    },
  }).then((events) => {
    /**
     * TODO
     * only render private events for super users or people on the list of attendees
     */
    if (events.length !== 1) {
      // TODO - make 404 page
      res.locals.status = 404;
      res.locals.alert.errorMessages.push('Event not found.');
      return res.status(res.locals.status).render('index', { title: 'Event not found' });
    }
    // Event was found - render details
    return res.status(res.locals.status).render('event/detail', {
      title: events[0].title,
      event: events[0],
    });
  }).catch((err) => {
    console.log(err);
    req.session.status = 500;
    req.session.alert.errorMessages.push('There was an error. Contact the tech chair if it persists.');
    return req.session.save(() => {
      req.redirect('/event');
    });
  });
};
exports.getDetails = getDetails;

/**
 * GET for event list page
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const getList = (req, res) => {
  // query for all events
  const eventPromise = models.Event.findAll({
    where: {
      public: true,
      meeting: false,
    },
    order: [
      ['start_time', 'ASC'],
    ],
  });

  const meetingPromise = models.Event.findAll({
    where: {
      meeting: true,
      public: true,
    },
    order: [
      ['start_time', 'ASC'],
    ],
  });

  return Promise.all([eventPromise, meetingPromise]).then((output) => {
    return res.status(res.locals.status).render('event/list', {
      title: 'Events',
      events: output[0],
      meetings: output[1],
    });
  }).catch((err) => {
    console.log(err);
    req.session.status = 500;
    req.session.alert.errorMessages.push('There was an error. Contact the tech chair if it persists.');
    return req.session.save(() => {
      return res.redirect('/');
    });
  });
};
exports.getList = getList;

/**
 * GET for the create event page
 */
const getCreate = (req, res) => {
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to create an event.');
    return req.session.save(() => {
      return res.redirect('/event');
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
 * @description Expects the following req.body objects:
 * `title`, `startTime`, `endTime`, `location`, `description`, `isMeeting`, `isPublic`
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
      return req.session.save(() => {
        return res.redirect('/event');
      });
    }

    const errors = validationResult(req).formatWith(({ msg }) => { return `${msg}`; });
    if (!errors.isEmpty()) {
      // There was a validation error
      res.locals.status = 400;
      // add errors as individual elements
      res.locals.alert.errorMessages.push(...errors.array());
      // render create page
      return getCreate(req, res, next);
    }

    // Convert string times to Date objects
    const startTime = Date.parse(req.body.startTime);
    const endTime = Date.parse(req.body.endTime);

    // check for invalid start/end times
    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
      if (Number.isNaN(startTime)) {
        res.locals.alert.errorMessages.push('The start time is not a valid time.');
      }
      if (Number.isNaN(endTime)) {
        res.locals.alert.errorMessages.push('The end time is not a valid time.');
      }
      res.locals.status = 400;
      return getCreate(req, res, next);
    }
    // Make sure the times are in the future and the end time is after the start time
    if (startTime >= endTime || startTime < Date.now()) {
      if (startTime < Date.now()) {
        res.locals.alert.errorMessages.push('The start time must be in the future.');
      }
      if (startTime >= endTime) {
        res.locals.alert.errorMessages.push('The end time must be after the start time.');
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
    }).then((event) => {
      // the event was succesfully created!
      req.session.status = 201;
      req.session.alert.successMessages.push('Event created!');
      return req.session.save(() => {
        return res.redirect(`/event/details/${event.id}`);
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

/**
 * POST to a signup page with an event with req.params.id id.
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const postSignup = (req, res) => {
  // Make sure the user is signed in
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to signup');
    return req.session.save(() => {
      return res.redirect(`/event/details/${req.params.id}`);
    });
  }

  // Get the event
  const eventPromise = models.Event.findById(req.params.id);

  // Get the member
  let memberEmail = null;
  // If the current user is a super user, they can specify a member
  // Super user tests
  if (req.user.super_user && req.body.email) {
    memberEmail = req.body.email;
  } else {
    memberEmail = req.user.email;
  }

  // A member cannot be signed up for an event for which they're already signed up
  const attendancePromise = models.Attendance.findOne({
    where: {
      member_email: memberEmail,
      event_id: req.params.id,
    },
  });

  // Once member and event have been found, continue with creating the attendance entry
  return Promise.all([eventPromise, attendancePromise]).then((output) => {
    // output is in order of array
    const event = output[0];
    const attendance = output[1];
    // If attendance exists there is no need to continue
    if (attendance) {
      req.session.status = 400;
      req.session.alert.errorMessages.push(`${memberEmail} is already signed up for this event.`);
      return req.session.save(() => {
        return res.redirect(`/event/details/${event.id}`);
      });
    }
    let status = models.Attendance.getStatusUnconfirmed();
    if (event.meeting) {
      status = models.Attendance.getStatusConfirmed();
    }
    if (!event.public) {
      // Private events are automatically confirmed because they're entered by a super user
      // TODO - check that user is a super user - only proceed if so
      status = models.Attendance.getStatusConfirmed();
    }

    // Create attendance
    return models.Attendance.create({
      event_id: req.params.id,
      member_email: memberEmail,
      status, // shorthand for status: status,
    }).then(() => {
      req.session.status = 201;
      req.session.alert.successMessages.push(`Signed up for ${event.title}`);
      return req.session.save(() => {
        return res.redirect(`/event/details/${event.id}`);
      });
    }).catch((err) => {
      // There was an error
      console.log(err);
      req.session.status = 500;
      req.session.alert.errorMessages.push('There was a problem. Please contact the tech chair if it persists.');
      return req.session.save(() => {
        return res.redirect(`/event/details/${req.params.id}`);
      });
    });
  }).catch((err) => {
    // There was an error
    console.log(err);
    req.session.status = 500;
    req.session.alert.errorMessages.push('There was a problem. Please contact the tech chair if it persists.');
    return req.session.save(() => {
      return res.redirect(`/event/details/${req.params.id}`);
    });
  });
};
exports.postSignup = postSignup;

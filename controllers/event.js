/**
 * Controller for all event related endpoints
 */
// const { check, validationResult } = require('express-validator/check');
// const models = require('../models/');

/**
 * GET for the create event page
 */
const getCreate = (req, res) => {
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to create an event.');
    // TODO - redirect to event page
    return res.redirect('/');
  }
  // TODO - check that user is a super user
  return res.status(res.locals.status).render('event/create', {
    title: 'Create Event',
  });
};
exports.getCreate = getCreate;

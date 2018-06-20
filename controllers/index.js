/**
 * This page is home to all code for controlling routes that
 * don't make sense to handle somewhere else
 */
// const { check, validationResult } = require('express-validator/check');
// const models = require('../models/');

const getIndex = (req, res) => {
  return res.status(res.locals.status).render('index', { title: 'CEAS Ambassadors' });
};
exports.getIndex = getIndex;

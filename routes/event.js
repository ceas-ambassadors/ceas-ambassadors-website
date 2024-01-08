/**
 * Routes for the events endpoints
 * All endpoints in this file have `/event` prepended to them
 * i.e. `...com/event/create` would just be `create` here
 */
const express = require('express');

const router = express.Router();

const eventController = require('../controllers/event');

router.get('/', eventController.getList);

router.get('/create', eventController.getCreate);

router.post('/create', eventController.postCreateEdit);

router.get('/:id', eventController.getDetails);

router.post('/:id/signup', eventController.postSignup);

router.post('/:id/removeSignup', eventController.postRemoveSignUp);

router.post('/:id/confirm', eventController.postConfirmAttendance);

router.post('/:id/change', eventController.postChangeAttendance);

router.post('/:id/delete', eventController.postDelete);

router.get('/:id/edit', eventController.getEdit);

router.get('/:id/attendanceStatus', eventController.getAttendanceStatus);

router.get('/:id/save', eventController.getSave);

module.exports = router;

/**
 * Routes for the member endpoints
 * All endpoints in this file have `/member` prepended to them
 * i.e. `...com/member/profile` would just be `create` here
 */
const express = require('express');
const memberHandler = require('../controllers/member');

const router = express.Router();

/* GET list of members */
router.get('/', memberHandler.getList);

/* POST /member/profile/update */
router.post('/profile/update', memberHandler.postProfileUpdate);

/* GET profile */
router.get('/:id', memberHandler.getProfile);

/* POST /member/:id/update-attributes */
router.post('/:id/update-attributes', memberHandler.postUpdateAttributes);

/* POST /member/:id/delete */
router.post('/:id/delete', memberHandler.postDelete);

module.exports = router;

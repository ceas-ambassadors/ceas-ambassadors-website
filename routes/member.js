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
router.get('/:email', memberHandler.getProfile);

/* POST /member/:email/update-attributes */
router.post('/:email/update-attributes', memberHandler.postUpdateAttributes);

module.exports = router;

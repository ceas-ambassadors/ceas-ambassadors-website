/**
 * Routes for the member endpoints
 * All endpoints in this file have `/member` prepended to them
 * i.e. `...com/member/profile` would just be `create` here
 */
const express = require('express');
const memberHandler = require('../controllers/member');

const router = express.Router();

/* POST /member/profile/update */
router.post('/profile/update', memberHandler.postProfileUpdate);

module.exports = router;

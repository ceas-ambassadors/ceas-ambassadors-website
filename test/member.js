/**
 * Tests for the member endpoints and functions
 */
/* eslint-disable no-undef */
// Immediately set environment to test
process.env.NODE_ENV = 'test';
const request = require('supertest');
// const assert = require('assert');
const app = require('../app.js');
// const models = require('../models');
const common = require('./common');

describe('Member tests', () => {
  after((done) => {
    common.clearDatabase().then(() => {
      done();
    });
  });

  beforeEach((done) => {
    common.clearDatabase().then(() => {
      done();
    });
  });

  describe('Member tests which require a logged in normal user', () => {
    let agent = null;

    beforeEach((done) => {
      agent = request.agent(app);
      // create and log in the user
      common.createNormalUserSession(agent).then(() => {
        done();
      });
    });
  });
});

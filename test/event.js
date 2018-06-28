/**
 * Tests for the event endpoints and functions
 */
/* eslint-disable no-undef */
// Immediately set environment to test
process.env.NODE_ENV = 'test';
const request = require('supertest');
// const assert = require('assert');
const app = require('../app.js');
// const models = require('../models');
const common = require('./common');

describe('Event Tests', () => {
  before((done) => {
    done();
  });

  after((done) => {
    done();
  });

  beforeEach((done) => {
    common.clearDatabase().then(() => {
      done();
    });
  });

  // GET create page while not signed in - non-users cannot see
  it('GET create not signed in', (done) => {
    request.agent(app)
      .get('/event/create')
      .redirects(1)
      .expect(401, done);
  });

  describe('Event tests which require a signed in user', () => {
    // need to persist agent across requests to mantain logged in session
    let agent = null;
    beforeEach((done) => {
      agent = request.agent(app);
      common.createNormalUserSession(agent).then(() => {
        done();
      });
    });

    // GET create page while signed in - should return page (only until super-user is implemented)
    it('GET create while signed in', (done) => {
      agent.get('/event/create')
        .expect(200, done);
    });

    // GET Create page while signed in as super user - should return page
  });
});

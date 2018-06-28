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

  it('GET create not signed in', (done) => {
    request.agent(app)
      .get('/event/create')
      .redirects(1)
      .expect(401, done);
  });

  describe('Event tests which require a signed in user', () => {
    let agent = null;
    beforeEach((done) => {
      agent = request.agent(app);
      common.createNormalUserSession(agent).then(() => {
        done();
      });
    });

    it('GET create', (done) => {
      agent.get('/event/create')
        .expect(200, done);
    });
  });
});

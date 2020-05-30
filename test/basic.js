/*
 * This file is home to the basic test suite. It uses some functions that confuse
 * eslint, so disable no-undef rule to allow for undefined functions
 */
/* eslint-disable no-undef */
// Immediately set environment to test
process.env.NODE_ENV = 'test';
const assert = require('assert');
const request = require('supertest');
const app = require('../app.js');
const models = require('../models');
const common = require('./common');

describe('Basic Tests', () => {
  // any actions that need done before all tests in this suite
  before((done) => {
    common.clearDatabase().then(() => {
      done();
    });
  });

  // any actions that need done after all tests in this suite
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

  // Test /
  it('GET hompeage', (done) => {
    request.agent(app)
      .get('/')
      .expect(200, done);
  });

  // GET /apply
  it('GET apply', (done) => {
    request.agent(app)
      .get('/apply')
      .expect(200, done);
  });

  // GET /virtual-tour
  it('GET /virtual-tour', (done) => {
    request.agent(app)
      .get('/virtual-tour')
      .expect(200, done);
  });

  // GET /booklet
  it('GET booklet', (done) => {
    request.agent(app)
      .get('/booklet')
      .expect(200, done);
  });

  // Test 404
  it('GET 404', (done) => {
    request.agent(app)
      .get('/404') // As long as the page 404 doesn't exist, this will give a 404
      .expect(404, done);
  });

  // Putting semester reset tests in this file because they don't make sense anywhere else
  describe('Semester reset tests', () => {
    it('Test getting reset page not logged in', (done) => {
      request.agent(app)
        .get('/reset')
        .redirects(1)
        .expect(401, done);
    });

    it('Test getting reset page as a normal user', () => {
      const agent = request.agent(app);
      return common.createNormalUser().then((member) => {
        return common.createUserSession(member, agent).then(() => {
          return agent
            .get('/reset')
            .redirects(1)
            .expect(403);
        });
      });
    });

    it('Test getting training page as a normal user', () => {
      const agent = request.agent(app);
      return common.createNormalUser().then((member) => {
        return common.createUserSession(member, agent).then(() => {
          return agent
            .get('/training')
            .expect(200);
        });
      });
    });

    it('Test getting reset page as a super user', () => {
      const agent = request.agent(app);
      return common.createSuperUser().then((member) => {
        return common.createUserSession(member, agent).then(() => {
          return agent
            .get('/reset')
            .expect(200);
        });
      });
    });

    it('Test posting to reset page not logged in', (done) => {
      request.agent(app)
        .post('/reset')
        .send({
          password: process.env.RESET_KEY,
        })
        .redirects(1)
        .expect(401, done);
    });

    it('Test posting to reset page as a normal user', () => {
      const agent = request.agent(app);
      return common.createNormalUser().then((member) => {
        // create a handful of events to make sure they aren't deleted
        const events = [];
        events.push(common.createPublicEvent());
        events.push(common.createPublicEvent());
        events.push(common.createMeeting());
        return Promise.all(events).then(() => {
          return common.createUserSession(member, agent).then(() => {
            const response = agent
              .post('/reset')
              .send({
                password: process.env.RESET_KEY,
              })
              .redirects(1)
              .expect(403);

            return response.then(() => {
              return models.Event.findAll({
                where: {},
              }).then((remainingEvents) => {
                assert.deepEqual(remainingEvents.length, 3);
              });
            });
          });
        });
      });
    });

    it('POST to reset page succesfully', () => {
      const agent = request.agent(app);
      return common.createSuperUser().then((member) => {
        // create a handful of events for deleting
        const events = [];
        events.push(common.createPublicEvent());
        events.push(common.createPublicEvent());
        events.push(common.createMeeting());
        return Promise.all(events).then(() => {
          return common.createUserSession(member, agent).then(() => {
            const response = agent
              .post('/reset')
              .send({
                password: process.env.RESET_KEY,
              })
              .redirects(1)
              .expect(200);

            return response.then(() => {
              return models.Event.findAll({
                where: {},
              }).then((remainingEvents) => {
                assert.deepEqual(remainingEvents.length, 0);
              });
            });
          });
        });
      });
    });

    it('POST to reset page with wrong password', () => {
      const agent = request.agent(app);
      return common.createSuperUser().then((member) => {
        // create a handful of events to make sure they aren't deleted
        const events = [];
        events.push(common.createPublicEvent());
        events.push(common.createPublicEvent());
        events.push(common.createMeeting());
        return Promise.all(events).then(() => {
          return common.createUserSession(member, agent).then(() => {
            const response = agent
              .post('/reset')
              .send({
                password: 'abackajs;dflkjas;',
              })
              .redirects(1)
              .expect(400);

            return response.then(() => {
              return models.Event.findAll({
                where: {},
              }).then((remainingEvents) => {
                assert.deepEqual(remainingEvents.length, 3);
              });
            });
          });
        });
      });
    });
  });
});

/**
 * Tests for the event endpoints and functions
 */
/* eslint-disable no-undef */
// Immediately set environment to test
process.env.NODE_ENV = 'test';
const request = require('supertest');
const assert = require('assert');
const app = require('../app.js');
const models = require('../models');
const common = require('./common');

describe('Event Tests', () => {
  before((done) => {
    done();
  });

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

  // GET create page while not signed in - non-users cannot see
  it('GET create not signed in', (done) => {
    request.agent(app)
      .get('/event/create')
      .redirects(1)
      .expect(401, done);
  });

  // Cannot post to create when not a super user - will redirect to '/'
  it('POST create not signed in', (done) => {
    request.agent(app)
      .post('/event/create')
      .redirects(1)
      .expect(401, done);
  });

  describe('Event tests which require a signed in non-super user', () => {
    // need to persist agent across requests to mantain logged in session
    let agent = null;
    beforeEach((done) => {
      agent = request.agent(app);
      common.createNormalUserSession(agent).then(() => {
        done();
      });
    });

    // GET create event - a normal user cannot access create event page

    // POST create event - a normal user cannot post create event page
  });

  describe('Event tests which require a signed in super user', () => {
    // These aren't actually implemented yet - but eventually some actions will require
    // super user privileges
    let agent = null;
    beforeEach((done) => {
      agent = request.agent(app);
      // TODO - use a superuser function
      common.createNormalUserSession(agent).then(() => {
        done();
      });
    });

    // GET create page while signed in - should return page (only until super-user is implemented)
    it('GET create while signed in', (done) => {
      agent.get('/event/create')
        .expect(200, done);
    });

    // Succesfully post to create event page
    it('POST to create event page', () => {
      response = agent.post('/event/create')
        .send({
          title: 'Test Event!',
          startTime: '2050 January 01 10:00 AM',
          endTime: '2050 January 01 11:00 AM',
          location: 'Baldwin Hall',
          description: 'A test event',
          isPublic: 'on',
          isMeeting: 'off',
        })
        .redirects(1)
        .expect(201);

      return response.then(() => {
        return models.Event.findAll({
          where: {
            title: 'Test Event!',
          },
        }).then((events) => {
          // assert that event exists
          assert(events[0], 'Event does not exist');
        });
      });
    });

    it('POST to create event with no title', () => {
      // POST create event with no title
      response = agent.post('/event/create')
        .send({
          startTime: '2050 January 01 10:00 AM',
          endTime: '2050 January 01 11:00 AM',
          location: 'Baldwin Hall',
          description: 'A test event',
          isPublic: 'on',
          isMeeting: 'off',
        })
        .expect(400);

      return response.then(() => {
        return models.Event.findAll({
          where: {},
        }).then((events) => {
          // assert that event does not exist
          assert.equal(events.length, 0, 'Event should not exist');
        });
      });
    });

    // POST create event with no location
    it('POST to create event with no location', () => {
      response = agent.post('/event/create')
        .send({
          title: 'No location event',
          startTime: '2050 January 01 10:00 AM',
          endTime: '2050 January 01 11:00 AM',
          description: 'A test event',
          isPublic: 'on',
          isMeeting: 'off',
        })
        .expect(400);

      return response.then(() => {
        return models.Event.findAll({
          where: {},
        }).then((events) => {
          // assert that event does not exist
          assert.equal(events.length, 0, 'Event should not exist');
        });
      });
    });

    // POST create event with no start time
    it('POST to create event with no start time', () => {
      response = agent.post('/event/create')
        .send({
          title: 'No Start time',
          endTime: '2050 January 01 11:00 AM',
          location: 'Baldwin Hall',
          description: 'A test event',
          isPublic: 'on',
          isMeeting: 'off',
        })
        .expect(400);

      return response.then(() => {
        return models.Event.findAll({
          where: {},
        }).then((events) => {
          // assert that event does not exist
          assert.equal(events.length, 0, 'Event should not exist');
        });
      });
    });

    // POST create event with no end time
    it('POST to create event with no end time', () => {
      response = agent.post('/event/create')
        .send({
          title: 'No end time',
          startTime: '2050 January 01 10:00 AM',
          location: 'Baldwin Hall',
          description: 'A test event',
          isPublic: 'on',
          isMeeting: 'off',
        })
        .expect(400);

      return response.then(() => {
        return models.Event.findAll({
          where: {},
        }).then((events) => {
          // assert that event does not exist
          assert.equal(events.length, 0, 'Event should not exist');
        });
      });
    });

    // POST create event with start time > end time
    it('POST to create event with start time > end time', () => {
      response = agent.post('/event/create')
        .send({
          title: 'Start time and end time out of order',
          startTime: '2050 January 01 11:00 AM',
          endTime: '2050 January 01 10:00 AM',
          location: 'Baldwin Hall',
          description: 'A test event',
          isPublic: 'on',
          isMeeting: 'off',
        })
        .expect(400);

      return response.then(() => {
        return models.Event.findAll({
          where: {},
        }).then((events) => {
          // assert that event does not exist
          assert.equal(events.length, 0, 'Event should not exist');
        });
      });
    });

    // POST create event with startTime < now
    it('POST to create event with start time < now', () => {
      response = agent.post('/event/create')
        .send({
          title: 'Start time and end time out of order',
          startTime: '2000 January 01 10:00 AM',
          endTime: '2000 January 01 11:00 AM',
          location: 'Baldwin Hall',
          description: 'A test event',
          isPublic: 'on',
          isMeeting: 'off',
        })
        .expect(400);

      return response.then(() => {
        return models.Event.findAll({
          where: {},
        }).then((events) => {
          // assert that event does not exist
          assert.equal(events.length, 0, 'Event should not exist');
        });
      });
    });
  });
});

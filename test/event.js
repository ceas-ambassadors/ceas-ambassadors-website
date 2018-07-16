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

  // GET event listing page
  it('GET event list page', () => {
    // Create an event and a meeting, so that we may know there aren't any problems with the queries
    const eventPromise = common.createPublicEvent();

    const meetingPromise = common.createMeeting();

    // Once both promises resolve, hit the endpoint and ensure we receive a 200
    return Promise.all([eventPromise, meetingPromise]).then(() => {
      return request.agent(app)
        .get('/event')
        .expect(200);
    });
  });

  // GET event page for event that does not exist
  // event ids are numerical, so `fake` should not return an event
  it('GET nonexistent event details', (done) => {
    request.agent(app)
      .get('/event/details/fake')
      .expect(404, done);
  });

  // GET event that has just been created
  it('GET event details page', () => {
    return common.createMeeting().then((event) => {
      return request.agent(app)
        .get(`/event/details/${event.id}`)
        .expect(200);
    });
  });

  // POST /event/signup/:id not signed in
  it('POST signup for event not signed in', () => {
    return common.createPublicEvent().then((event) => {
      return request.agent(app)
        .post(`/event/signup/${event.id}`)
        .redirects(1)
        .expect(401);
    });
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

    // GET private event - normal users cannot see a private event if not on attendees list

    // GET private event as an attendee

    // POST signup for an event
    it('POST signup for event', () => {
      return common.createPublicEvent().then((event) => {
        const response = agent
          .post(`/event/signup/${event.id}`)
          .redirects(1)
          .expect(201);

        return response.then(() => {
          const attendancePromise = models.Attendance.findOne({
            where: {
              event_id: event.id,
              member_email: 'normal@kurtjlewis.com',
            },
          }).then((attendance) => {
            assert(attendance);
            assert.deepEqual(attendance.status, models.Attendance.getStatusUnconfirmed());
          });

          // events should not increase amount of service attended, added as unconfirmed
          const memberPromise = models.Member.findById('normal@kurtjlewis.com').then((member) => {
            assert.equal(member.service, 0);
          });

          return Promise.all([attendancePromise, memberPromise]);
        });
      });
    });

    // POST signup for a meeting
    it('POST signup for Meeting', () => {
      return common.createMeeting().then((event) => {
        const response = agent
          .post(`/event/signup/${event.id}`)
          .redirects(1)
          .expect(201);

        return response.then(() => {
          const attendancePromise = models.Attendance.findOne({
            where: {
              event_id: event.id,
              member_email: 'normal@kurtjlewis.com',
            },
          }).then((attendance) => {
            assert(attendance);
            assert.deepEqual(attendance.status, models.Attendance.getStatusConfirmed());
          });

          // Meeting should automatically add to the meeting count
          const memberPromise = models.Member.findById('normal@kurtjlewis.com').then((member) => {
            assert.equal(member.meetings, 1);
          });

          return Promise.all([attendancePromise, memberPromise]);
        });
      });
    });

    // POST signup for an event that has already been signed up for
    it('POST signup for event that has already been signed up for', () => {
      return common.createPublicEvent().then((event) => {
        const response = agent
          .post(`/event/signup/${event.id}`)
          .redirects(1)
          .expect(201);

        return response.then(() => {
          return agent
            .post(`/event/signup/${event.id}`)
            .redirects(1)
            .expect(400);
        });
      });
    });

    // POST signup for event with specified email as non super user
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

    // POST signup with specified email
  });
});

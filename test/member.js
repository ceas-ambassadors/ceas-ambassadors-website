/**
 * Tests for the member endpoints and functions
 */
/* eslint-disable no-undef */
// Immediately set environment to test
process.env.NODE_ENV = 'test';
const request = require('supertest');
const assert = require('assert');
const app = require('../app.js');
const models = require('../models');
const common = require('./common');

describe('Member tests', () => {
  // whipe entire database after conclusion of tests
  after((done) => {
    common.clearDatabase().then(() => {
      done();
    });
  });

  // Clear the entire database before each test
  beforeEach((done) => {
    common.clearDatabase().then(() => {
      done();
    });
  });

  // POST /member/profile/update without being signed in - should 401
  it('POST /member/profile/update not signed in', (done) => {
    request.agent(app)
      .post('/member/profile/update')
      .send({
        firstName: 'Test',
        lastName: 'User',
        hometown: 'TestVille',
        major: 'Testing',
        gradYear: '2050',
        minors: 'Javascript',
        clubs: 'Test Club',
        coops: 'Testing INC',
        accend: true,
      })
      .redirects(1)
      .expect(401, done);
  });

  // GET /member/profile of created member
  it('GET profile of existing member', () => {
    return models.Member.create({
      email: 'profile@kurtjlewis.com',
      first_name: 'Profile',
      last_name: 'mcProfile',
      password: 'This isnt a hash!', // okay because we won't be logging in
      accend: false,
      private_user: false,
      super_user: false,
    }).then(() => {
      return request.agent(app)
        .get('/member/profile/profile@kurtjlewis.com')
        .expect(200);
    });
  });

  // GET /member/profile/ of a non-existent emial
  it('GET profile of non-existent member', (done) => {
    request.agent(app)
      .get('/member/profile/not-real@kurtjlewis.com')
      .expect(404, done);
  });

  describe('Member tests which require a logged in normal user', () => {
    let agent = null;
    // Create a normal user session
    beforeEach((done) => {
      agent = request.agent(app);
      // create and log in the user
      common.createNormalUserSession(agent).then(() => {
        done();
      });
    });

    // POST /member/profile/update successfully
    it('POST /member/profile/update successfully', () => {
      const firstName = 'Test';
      const lastName = 'User';
      const hometown = 'TestVille';
      const major = 'Testing';
      const gradYear = '2050';
      const minors = 'Javascript';
      const clubs = 'Test Club';
      const coops = 'Testing INC';
      const accendFrontend = 'on'; // because it's a checkbox on the frontend
      const accend = true; // expected end value
      const response = agent.post('/member/profile/update')
        .send({
          firstName,
          lastName,
          hometown,
          major,
          gradYear,
          minors,
          clubs,
          coops,
          accend: accendFrontend,
        })
        .redirects(1)
        .expect(200);

      return response.then(() => {
        return models.Member.findAll({
          where: {
            email: common.getNormalUserEmail(),
          },
        }).then((members) => {
          // TODO - this won't actually fail the test - see #15
          const member = members[0]; // for brevity
          assert(member);
          assert.deepEqual(member.first_name, firstName);
          assert.deepEqual(member.last_name, lastName);
          assert.deepEqual(member.hometown, hometown);
          assert.deepEqual(member.major, major);
          assert.deepEqual(member.grad_year, gradYear);
          assert.deepEqual(member.clubs, clubs);
          assert.deepEqual(member.coops, coops);
          assert.equal(member.accend, accend);
        });
      });
    });
  });
});

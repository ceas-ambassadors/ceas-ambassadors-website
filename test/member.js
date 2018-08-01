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
        .get('/member/profile@kurtjlewis.com/profile')
        .expect(200);
    });
  });

  // GET /member/profile/ of a non-existent emial
  it('GET profile of non-existent member', (done) => {
    request.agent(app)
      .get('/member/not-real@kurtjlewis.com/profile')
      .expect(404, done);
  });

  // POST to /member/:email/update-attributes not signed in
  it('POST /member/test@kurtjlewis.com/update-attributes not signed in', () => {
    const email = 'test@kurtjlewis.com';
    return models.Member.create({
      email,
      password: 'blah', // doesn't matter because we won't be logging in
      accend: false,
      super_user: false,
      private_user: false,
    }).then(() => {
      const response = request.agent(app)
        .post(`/member/${email}/update-attributes?super_user=true&private_user=true`)
        .redirects(1)
        .expect(401);
      return response.then(() => {
        return models.Member.findById(email).then((member) => {
          assert.equal(member.super_user, false);
          assert.equal(member.private_user, false);
        });
      });
    });
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
        return models.Member.findById(common.getNormalUserEmail()).then((member) => {
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

    // POST /member/profile/update with not all values
    it('POST /member/profile/update with only some values', () => {
      const firstName = 'Test';
      const lastName = 'User';
      const hometown = 'TestVille';
      const accendFrontend = 'on'; // because it's a checkbox on the frontend
      const accend = true; // expected end value
      const response = agent.post('/member/profile/update')
        .send({
          firstName,
          lastName,
          hometown,
          accend: accendFrontend,
        })
        .redirects(1)
        .expect(200);

      return response.then(() => {
        return models.Member.findById(common.getNormalUserEmail()).then((member) => {
          assert(member);
          assert.deepEqual(member.first_name, firstName);
          assert.deepEqual(member.last_name, lastName);
          assert.deepEqual(member.hometown, hometown);
          assert.equal(member.accend, accend);
        });
      });
    });

    // POST /member/profile/update with grad year = ''
    it('POST /member/profile/update with gradYear=empty string', () => {
      const gradYear = '';
      const response = agent.post('/member/profile/update')
        .send({
          gradYear,
        })
        .redirects(1)
        .expect(200);
      return response.then(() => {
        return models.Member.findById(common.getNormalUserEmail()).then((member) => {
          assert(member);
          assert.deepEqual(member.grad_year, null);
        });
      });
    });

    // POST to /member/:email/update-attributes as normal user and fail
    it('POST /member/test@kurtjlewis.com/update-attributes as normal user', () => {
      const email = 'test@kurtjlewis.com';
      return models.Member.create({
        email,
        password: 'blah', // doesn't matter because we won't be logging in
        accend: false,
        super_user: false,
        private_user: false,
      }).then(() => {
        const response = agent
          .post(`/member/${email}/update-attributes?super_user=true&private_user=true`)
          .redirects(1)
          .expect(403);
        return response.then(() => {
          return models.Member.findById(email).then((member) => {
            assert.equal(member.super_user, false);
            assert.equal(member.private_user, false);
          });
        });
      });
    });
  });

  describe('Tests which require a signed in super user', () => {
    let agent = null;
    // Create a normal user session
    beforeEach((done) => {
      agent = request.agent(app);
      // create and log in the user
      common.createSuperUserSession(agent).then(() => {
        done();
      });
    });

    // POST /member/:email/update-attributes with no query params
    it(`POST /member/${common.getNormalUserEmail()}/update-attributes with no query params`, () => {
      return models.Member.create({
        email: common.getNormalUserEmail(),
        password: 'blah', // doesn't matter because we won't be logging in
        accend: false,
        super_user: false,
        private_user: false,
      }).then(() => {
        const response = agent
          .post(`/member/${common.getNormalUserEmail()}/update-attributes?super_user=false&private_user=false`)
          .redirects(1)
          .expect(304);
        return response.then(() => {
          return models.Member.findById(common.getNormalUserEmail()).then((member) => {
            assert.equal(member.super_user, false);
            assert.equal(member.private_user, false);
          });
        });
      });
    });

    // POST /member/:email/update-attributes to elevate to super user
    it(`POST /member/${common.getNormalUserEmail()}/update-attributes to elevate super user`, () => {
      return models.Member.create({
        email: common.getNormalUserEmail(),
        password: 'blah', // doesn't matter because we won't be logging in
        accend: false,
        super_user: false,
        private_user: false,
      }).then(() => {
        const response = agent
          .post(`/member/${common.getNormalUserEmail()}/update-attributes?super_user=true`)
          .redirects(1)
          .expect(200);
        return response.then(() => {
          return models.Member.findById(common.getNormalUserEmail()).then((member) => {
            assert.equal(member.super_user, true);
            assert.equal(member.private_user, false);
          });
        });
      });
    });

    // POST /member/:email/update-attributes to demote from super user
    it(`POST /member/${common.getNormalUserEmail()}/update-attributes to demote super user`, () => {
      return models.Member.create({
        email: common.getNormalUserEmail(),
        password: 'blah', // doesn't matter because we won't be logging in
        accend: false,
        super_user: true,
        private_user: false,
      }).then(() => {
        const response = agent
          .post(`/member/${common.getNormalUserEmail()}/update-attributes?super_user=false`)
          .redirects(1)
          .expect(200);
        return response.then(() => {
          return models.Member.findById(common.getNormalUserEmail()).then((member) => {
            assert.equal(member.super_user, false);
            assert.equal(member.private_user, false);
          });
        });
      });
    });

    // POST /member/:email/update-attributes to set user to private
    it(`POST /member/${common.getNormalUserEmail()}/update-attributes to set user to private`, () => {
      return models.Member.create({
        email: common.getNormalUserEmail(),
        password: 'blah', // doesn't matter because we won't be logging in
        accend: false,
        super_user: false,
        private_user: false,
      }).then(() => {
        const response = agent
          .post(`/member/${common.getNormalUserEmail()}/update-attributes?private_user=true`)
          .redirects(1)
          .expect(200);
        return response.then(() => {
          return models.Member.findById(common.getNormalUserEmail()).then((member) => {
            assert.equal(member.super_user, false);
            assert.equal(member.private_user, true);
          });
        });
      });
    });

    // POST /member/:email/update-attributes to set user to public
    it(`POST /member/${common.getNormalUserEmail()}/update-attributes to set user to public`, () => {
      return models.Member.create({
        email: common.getNormalUserEmail(),
        password: 'blah', // doesn't matter because we won't be logging in
        accend: false,
        super_user: false,
        private_user: true,
      }).then(() => {
        const response = agent
          .post(`/member/${common.getNormalUserEmail()}/update-attributes?private_user=false`)
          .redirects(1)
          .expect(200);
        return response.then(() => {
          return models.Member.findById(common.getNormalUserEmail()).then((member) => {
            assert.equal(member.super_user, false);
            assert.equal(member.private_user, false);
          });
        });
      });
    });

    // POST /member/:email/update-attributes with bad value for super_user and private_user
    it(`POST /member/${common.getNormalUserEmail()}/update-attributes with bad values`, () => {
      return models.Member.create({
        email: common.getNormalUserEmail(),
        password: 'blah', // doesn't matter because we won't be logging in
        accend: false,
        super_user: false,
        private_user: true,
      }).then(() => {
        const response = agent
          .post(`/member/${common.getNormalUserEmail()}/update-attributes?private_user=f&super_user=f`)
          .redirects(1)
          .expect(304);
        return response.then(() => {
          return models.Member.findById(common.getNormalUserEmail()).then((member) => {
            assert.equal(member.super_user, false);
            assert.equal(member.private_user, true);
          });
        });
      });
    });
  });
});

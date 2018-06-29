/**
 * This file is home to the account suite of tests - tests that hit the endpoints
 * around signing up, logging in, and etc
 */
/* eslint-disable no-undef */
// Immediately set environment to test
process.env.NODE_ENV = 'test';
const request = require('supertest');
const assert = require('assert');
const app = require('../app.js');
const models = require('../models');
const common = require('./common');

describe('Account Tests', () => {
  before((done) => {
    // tests start so quick after the app code is loaded
    // that sequelize hasn't had a chance to create the Session table
    // so force sync it to make sure it is there.s
    models.Session.sync();
    done();
  });

  // Make sure there are no records before tests start
  beforeEach((done) => {
    // delete all records in Member table
    common.clearDatabase(done);
  });

  // Make sure there are no records after tests finish
  afterEach((done) => {
    // delete all records in Member table
    common.clearDatabase(done);
  });

  // GET /login/
  it('GET login page', (done) => {
    request.agent(app)
      .get('/login')
      .expect(200, done);
  });

  // POST login with bad email

  // POST login with empty password

  // GET /signup/
  it('GET signup page', (done) => {
    request.agent(app)
      .get('/signup')
      .expect(200, done);
  });

  // POST signup
  it('POST signup', () => {
    response = request.agent(app)
      .post('/signup')
      .send({
        email: 'test@kurtjlewis.com',
        password: 'password',
        confirmPassword: 'password',
      })
      .redirects(1)
      .expect(201);
    // check that test@kurtjlewis.com was  added to the database
    return response.then(() => {
      return models.Member.findAll({
        where: {
          email: 'test@kurtjlewis.com',
        },
      }).then((members) => {
        assert(members[0], 'The member does not exist');
      });
    });
  });

  // POST signup while signed in

  // POST signup with no email
  it('POST signup wtih no email', () => {
    response = request.agent(app)
      .post('/signup')
      .send({
        email: '',
        password: 'test_password',
        confirmPassword: 'test_password',
      })
      .expect(400);
    // check that no accounts were added to the database
    return response.then(() => {
      return models.Member.findAll({
        where: {},
      }).then((members) => {
        assert.equal(members.length, 0);
      });
    });
  });

  // POST signup with no password
  it('POST signup wtih no password', () => {
    response = request.agent(app)
      .post('/signup')
      .send({
        email: 'bad_email@kurtjlewis.com',
        password: '',
        confirmPassword: 'test_password',
      })
      .expect(400);
    // check that bad_email@kurtjlewis.com was not added to the database
    return response.then(() => {
      return models.Member.findAll({
        where: {
          email: 'bad_email@kurtjlewis.com',
        },
      }).then((members) => {
        assert.equal(members.length, 0);
      });
    });
  });

  // POST signup with no confirmPassword
  it('POST signup wtih no confirmPassword', () => {
    response = request.agent(app)
      .post('/signup')
      .send({
        email: 'bad_email@kurtjlewis.com',
        password: 'test_password',
        confirmPassword: '',
      })
      .expect(400);
    // check that bad_email@kurtjlewis.com was not added to the database
    return response.then(() => {
      return models.Member.findAll({
        where: {
          email: 'bad_email@kurtjlewis.com',
        },
      }).then((members) => {
        assert.equal(members.length, 0);
      });
    });
  });

  // POST signup with password != confirm password
  it('POST signup wtih mismatched passwords', () => {
    response = request.agent(app)
      .post('/signup')
      .send({
        email: 'bad_email@kurtjlewis.com',
        password: 'test_password',
        confirmPassword: 'test_password_bad',
      })
      .expect(400);
    // check that bad_email@kurtjlewis.com was not added to the database
    return response.then(() => {
      return models.Member.findAll({
        where: {
          email: 'bad_email@kurtjlewis.com',
        },
      }).then((members) => {
        assert.equal(members.length, 0);
      });
    });
  });

  // GET logout without being signed in

  describe('Tests which require an existing user', () => {
    // any actions that need done before all tests in this suite
    beforeEach((done) => {
      // create a user for the tests
      models.Member.generatePasswordHash('password').then((passwordHash) => {
        models.Member.create({
          email: 'test@kurtjlewis.com',
          password: passwordHash,
          accend: false,
          super_user: false,
          private_user: false,
        }).finally(done);
      });
    });

    // Try to register a user with an email that already exists
    it('POST signup with already used email', (done) => {
      request.agent(app)
        .post('/signup')
        .send({
          email: 'test@kurtjlewis.com',
          password: 'password',
          confirmPassword: 'password',
        })
        .expect(400, done);
    });

    // Try to login - should also hit logout after verifying - need not test logout's success

    describe('Tests which require being signed inj', () => {
      beforeEach((done) => {
        // sign the test@email.com in
        done();
      });

      afterEach((done) => {
        // any necessary cleanup actions
        done();
      });
      // GET logout

      // GET signup while signed in

      // GET login while signed in

      // POST login while signed in
    });
  });
});

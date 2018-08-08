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
    done();
  });

  // Make sure there are no records before tests start
  beforeEach((done) => {
    // delete all records in Member table
    common.clearDatabase().then(() => {
      done();
    });
  });

  // Make sure there are no records after tests finish
  afterEach((done) => {
    // delete all records in Member table
    common.clearDatabase().then(() => {
      done();
    });
  });

  // GET /login/
  it('GET login page', (done) => {
    request.agent(app)
      .get('/login')
      .expect(200, done);
  });

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
        email: 'test@mail.uc.edu',
        firstName: 'Test',
        lastName: 'Testerson',
        password: 'password',
        confirmPassword: 'password',
      })
      .redirects(1)
      .expect(201);
    // check that test@mail.uc.edu was  added to the database
    return response.then(() => {
      return models.Member.findById('test@mail.uc.edu').then((member) => {
        assert(member, 'The member does not exist');
      });
    });
  });

  // POST signup with no email
  it('POST signup wtih no email', () => {
    response = request.agent(app)
      .post('/signup')
      .send({
        email: '',
        firstName: 'Test',
        lastName: 'Testerson',
        password: 'test_password',
        confirmPassword: 'test_password',
      })
      .redirects(1)
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
        email: 'bad_email@mail.uc.edu',
        firstName: 'Test',
        lastName: 'Testerson',
        password: '',
        confirmPassword: 'test_password',
      })
      .redirects(1)
      .expect(400);
    // check that bad_email@mail.uc.edu was not added to the database
    return response.then(() => {
      return models.Member.findById('bad_email@mail.uc.edu').then((member) => {
        assert(!member);
      });
    });
  });

  // POST signup with no confirmPassword
  it('POST signup wtih no confirmPassword', () => {
    response = request.agent(app)
      .post('/signup')
      .send({
        email: 'bad_email@mail.uc.edu',
        firstName: 'Test',
        lastName: 'Testerson',
        password: 'test_password',
        confirmPassword: '',
      })
      .redirects(1)
      .expect(400);
    // check that bad_email@mail.uc.edu was not added to the database
    return response.then(() => {
      return models.Member.findById('bad_email@mail.uc.edu').then((member) => {
        assert(!member);
      });
    });
  });

  // POST signup with password != confirm password
  it('POST signup wtih mismatched passwords', () => {
    response = request.agent(app)
      .post('/signup')
      .send({
        email: 'bad_email@mail.uc.edu',
        firstName: 'Test',
        lastName: 'Testerson',
        password: 'test_password',
        confirmPassword: 'test_password_bad',
      })
      .redirects(1)
      .expect(400);
    // check that bad_email@mail.uc.edu was not added to the database
    return response.then(() => {
      return models.Member.findById('bad_email@mail.uc.edu').then((member) => {
        assert(!member);
      });
    });
  });

  // POST signup with no first name
  it('POST signup wtih no fist name', () => {
    response = request.agent(app)
      .post('/signup')
      .send({
        email: 'bad_email@mail.uc.edu',
        lastName: 'Testerson',
        password: 'test_password',
        confirmPassword: 'test_password',
      })
      .redirects(1)
      .expect(400);
    // check that bad_email@mail.uc.edu was not added to the database
    return response.then(() => {
      return models.Member.findById('bad_email@mail.uc.edu').then((member) => {
        assert(!member);
      });
    });
  });

  // POST signup with no last name
  it('POST signup wtih no last name', () => {
    response = request.agent(app)
      .post('/signup')
      .send({
        email: 'bad_email@mail.uc.edu',
        firstName: 'Test',
        password: 'test_password',
        confirmPassword: 'test_password',
      })
      .redirects(1)
      .expect(400);
    // check that bad_email@mail.uc.edu was not added to the database
    return response.then(() => {
      return models.Member.findById('bad_email@mail.uc.edu').then((member) => {
        assert(!member);
      });
    });
  });

  it('POST signup with non-uc.edu email address', () => {
    response = request.agent(app)
      .post('/signup')
      .send({
        email: 'bad_email@kurtjlewis.com',
        firstName: 'Test',
        lastName: 'Testerson',
        password: 'test_password',
        confirmPassword: 'test_password',
      })
      .redirects(1)
      .expect(400);
    // c heck that bad_email@kurtjlewis.com was not added to the database
    return response.then(() => {
      return models.Member.findById('bad_email@kurtjlewis.com').then((member) => {
        assert(!member);
      });
    });
  });

  // should reject a change in password when no user is logged in
  it('POST change-password without being logged in', (done) => {
    request.agent(app)
      .post('/change-password')
      .send({
        firstName: 'Test',
        lastName: 'Testerson',
        currentPassword: 'password',
        newPassword: 'newPassword',
        repeatNewPassword: 'newPassword',
      })
      .redirects(1)
      .expect(401, done);
  });

  // GET logout without being signed in
  it('GET /logout without being signed in.', (done) => {
    request.agent(app)
      .get('/logout')
      .redirects(1)
      .expect(400, done);
  });

  describe('Tests which require a created but not signed in user', () => {
    beforeEach((done) => {
      common.createNormalUser().then(() => {
        done();
      });
    });

    // POST login
    it('POST /login successfully', (done) => {
      request.agent(app)
        .post('/login')
        .send({
          email: common.getNormalUserEmail(),
          password: 'password',
        })
        .redirects(1)
        .expect(200, done);
    });

    // POST login with bad password
    it('POST /login with bad password', (done) => {
      request.agent(app)
        .post('/login')
        .send({
          email: common.getNormalUserEmail(),
          password: 'password-WRONG',
        })
        .redirects(1)
        .expect(401, done);
    });

    // POST login with bad email
    it('POST /login with bad email', (done) => {
      request.agent(app)
        .post('/login')
        .send({
          email: 'fake@mail.uc.edu',
          password: 'password',
        })
        .redirects(1)
        .expect(401, done);
    });

    // Try to register a user with an email that already exists
    it('POST signup with already used email', (done) => {
      request.agent(app)
        .post('/signup')
        .send({
          email: common.getNormalUserEmail(),
          firstName: 'Test',
          lastName: 'Testerson',
          password: 'password',
          confirmPassword: 'password',
        })
        .redirects(1)
        .expect(400, done);
    });
  });

  describe('Tests which require being signed in', () => {
    let agent = null;
    beforeEach((done) => {
      agent = request.agent(app);
      // sign the user in
      common.createNormalUserSession(agent).then(() => {
        done();
      });
    });

    afterEach((done) => {
      // any necessary cleanup actions
      done();
    });

    // GET logout
    it('GET /logout', (done) => {
      agent.get('/logout')
        .redirects(1)
        .expect(200, done);
    });

    // GET signup while signed in
    it('GET /signup while signed in', (done) => {
      agent.get('/signup')
        .redirects(1)
        .expect(400, done);
    });

    // GET login while signed in
    it('GET /login while signed in', (done) => {
      agent.get('/login')
        .redirects(1)
        .expect(400, done);
    });

    // POST login while signed in
    it('POST /login while signed in', (done) => {
      agent.post('/login')
        .send({
          email: common.getNormalUserEmail(),
          password: 'password',
        })
        .redirects(1)
        .expect(400, done);
    });

    // POST signup while signed in
    it('POST /signup while signed in', (done) => {
      request.agent(app)
        .post('/signup')
        .send({
          email: common.getNormalUserEmail(),
          firstName: 'Test',
          lastName: 'Testerson',
          password: 'password',
          confirmPassword: 'password',
        })
        .redirects(1)
        .expect(400, done);
    });

    // POST change-password successfully
    it('POST to change-password succesfully', () => {
      response = agent.post('/change-password')
        .send({
          currentPassword: 'password',
          newPassword: 'newPassword',
          repeatNewPassword: 'newPassword',
        })
        .redirects(1)
        .expect(200);

      return response.then(() => {
        return models.Member.findById(common.getNormalUserEmail()).then((member) => {
          return models.Member.comparePassword('newPassword', member).then((res) => {
            assert(res, 'The new password was not applied.');
          });
        });
      });
    });

    // POST change-password without currentPassword
    it('POST to change-password without currentPassword', () => {
      response = agent.post('/change-password')
        .send({
          newPassword: 'newPassword',
          repeatNewPassword: 'newPassword',
        })
        .redirects(1)
        .expect(400);

      return response.then(() => {
        return models.Member.findById(common.getNormalUserEmail()).then((member) => {
          return models.Member.comparePassword('newPassword', member).then((res) => {
            assert(!res, 'The new password was wrongfully applied.');
          });
        });
      });
    });

    // POST change-password without newPassword
    it('POST to change-password without newPassword', () => {
      response = agent.post('/change-password')
        .send({
          currentPassword: 'password',
          repeatNewPassword: 'newPassword',
        })
        .redirects(1)
        .expect(400);

      return response.then(() => {
        return models.Member.findById(common.getNormalUserEmail()).then((member) => {
          return models.Member.comparePassword('newPassword', member).then((res) => {
            assert(!res, 'The new password was wrongfully applied.');
          });
        });
      });
    });

    // POST change-password without repeatNewPassword
    it('POST to change-password without repeatNewPassword', () => {
      response = agent.post('/change-password')
        .send({
          currentPassword: 'password',
          newPassword: 'newPassword',
        })
        .redirects(1)
        .expect(400);

      return response.then(() => {
        return models.Member.findById(common.getNormalUserEmail()).then((member) => {
          return models.Member.comparePassword('newPassword', member).then((res) => {
            assert(!res, 'The new password was wrongfully applied.');
          });
        });
      });
    });

    // POST change-password with incorrect current password
    it('POST to change-password without currentPassword', () => {
      response = agent.post('/change-password')
        .send({
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword',
          repeatNewPassword: 'newPassword',
        })
        .redirects(1)
        .expect(400);

      return response.then(() => {
        return models.Member.findById(common.getNormalUserEmail()).then((member) => {
          return models.Member.comparePassword('newPassword', member).then((res) => {
            assert(!res, 'The new password was wrongfully applied.');
          });
        });
      });
    });

    // POST change-password without new passwords that don't match
    it('POST to change-password without currentPassword', () => {
      response = agent.post('/change-password')
        .send({
          currentPassword: 'password',
          newPassword: 'newPassword',
          repeatNewPassword: 'wrongPassword',
        })
        .redirects(1)
        .expect(400);

      return response.then(() => {
        return models.Member.findById(common.getNormalUserEmail()).then((member) => {
          return models.Member.comparePassword('newPassword', member).then((res) => {
            assert(!res, 'The new password was wrongfully applied.');
          });
        });
      });
    });
  });
});

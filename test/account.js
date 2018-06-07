/**
 * This file is home to the account suite of tests
 */
/* eslint-disable no-undef */
// Immediately set environment to test
process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app.js');

describe('Account Tests', () => {
  // GET /login/
  it('GET login page', (done) => {
    request.agent(app)
      .get('/login')
      .expect(200, done);
  });

  // GET login while signed in

  // POST login

  // POST login while signed in

  // POST login with bad email

  // POST login with empty password

  // GET /signup/
  it('GET signup page', (done) => {
    request.agent(app)
      .get('/signup')
      .expect(200, done);
  });

  // GET signup while signed in

  // POST signup

  // POST signup while signed in

  // POST signup with no email
  it('POST signup wtih no email', (done) => {
    request.agent(app)
      .post('/signup')
      .send({
        email: '',
        password: 'test_password',
        confirmPassword: 'test_password',
      })
      .expect(400, done);
  });

  // POST signup with no password
  it('POST signup wtih no password', (done) => {
    request.agent(app)
      .post('/signup')
      .send({
        email: 'test_email@test.com',
        password: 'test_password',
        confirmPassword: '',
      })
      .expect(400, done);
  });

  // POST signup with no confirmPassword
  it('POST signup wtih no confirmPassword', (done) => {
    request.agent(app)
      .post('/signup')
      .send({
        email: 'test_email@test.com',
        password: 'test_password',
        confirmPassword: '',
      })
      .expect(400, done);
  });

  // POST signup with password != confirm password
  it('POST signup wtih mismatched passwords', (done) => {
    request.agent(app)
      .post('/signup')
      .send({
        email: 'test_email@test.com',
        password: 'test_password',
        confirmPassword: 'test_password_bad',
      })
      .expect(400, done);
  });
});

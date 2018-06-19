/*
 * This file is home to the basic test suite. It uses some functions that confuse
 * eslint, so disable no-undef rule to allow for undefined functions
 */
/* eslint-disable no-undef */
// Immediately set environment to test
process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../app.js');
const models = require('../models');

describe('Basic Tests', () => {
  // any actions that need done before all tests in this suite
  before((done) => {
    const memberPromise = models.Member.destroy({
      where: {},
    });
    const sessionPromise = models.Session.destroy({
      where: {},
    });
    Promise.all([memberPromise, sessionPromise]).then(() => {
      done();
    });
  });

  // any actions that need done after all tests in this suite
  after((done) => {
    const memberPromise = models.Member.destroy({
      where: {},
    });
    const sessionPromise = models.Session.destroy({
      where: {},
    });
    Promise.all([memberPromise, sessionPromise]).then(() => {
      done();
    });
  });

  // Test /
  it('GET hompeage', (done) => {
    request.agent(app)
      .get('/')
      .expect(200, done);
  });

  // Test 404
  it('GET 404', (done) => {
    request.agent(app)
      .get('/404') // As long as the page 404 doesn't exist, this will give a 404
      .expect(404, done);
  });
});

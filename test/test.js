/*
 * This file is home to the test suite. It uses some functions that confues
 * eslint, so disable no-undef rule to allow for undefined functions
 */
/* eslint-disable no-undef */
process.env.NODE_ENV = 'test';
const request = require('supertest');
// starts the website
require('../bin/www');

//  an instance of the server
const server = request.agent('http://localhost:3000');

describe('Ambassador Site Tests', () => {
  // any actions that need done before ALL tests
  before((done) => {
    done();
  });

  // any actions that need done after ALL tests
  after((done) => {
    done();
  });

  describe('Basic Tests', () => {
    // Test /
    it('Get hompeage', (done) => {
      const response = server.get('/');
      // Assert 200 response code
      response.expect(200, done);
    });
  });
});

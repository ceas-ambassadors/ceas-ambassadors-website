/**
 * Tests for the attendance hooks
 */
/* eslint-disable no-undef */
// Immediately set enviornment to test
process.env.NODE_ENV = 'test';
// const assert = require('assert');
// const models = require('../models');
const common = require('./common');

describe('Attendance Tests', () => {
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

  describe('Check attendance hooks', () => {
    // create status unconfirmed

    // create status not needed

    // create status confirmed

    // edit status unconfirmed -> confirmed

    // edit status unconfirmed -> not needed

    // edit status not needed -> unconfirmed

    // edit status not needed -> confirmed

    // edit status confirmed -> unconfirmed

    // edit status confirmed -> not needed

    // delete unconfirmed attendance

    // delete not needed attendance

    // delete confirmed attendance

    // test bulk create hooks

    // test bulk destroy hooks

    // test bulk update hooks

    // test confirmed for meeting

  });

  describe('Check Event hooks', () => {
    // test changing event times for unconfirmed attendance

    // test changing event times for not needed attendance

    // test changing event times for meeting

    // test deleting event for meeting

    // test deleting event for event
  });
});

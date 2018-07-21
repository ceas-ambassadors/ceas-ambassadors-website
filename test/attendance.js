/**
 * Tests for the attendance hooks
 */
/* eslint-disable no-undef */
// Immediately set enviornment to test
process.env.NODE_ENV = 'test';
const assert = require('assert');
require('../app.js');
const models = require('../models');
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
    // create status unconfirmed for event
    // should not increase member service
    it('Create event with status unconfirmed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then(() => {
          // assert that the member service didn't change
          return models.Member.findById(common.getNormalUserEmail()).then((member) => {
            assert.equal(member.service, 0);
            assert.equal(member.meetings, 0);
            assert.equal(member.service_not_needed, 0);
          });
        });
      });
    });

    // create status not needed for event
    it('Create event with status not needed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
        }).then(() => {
          // assert that only the member not needed service changed
          return models.Member.findById(common.getNormalUserEmail()).then((member) => {
            assert.equal(member.service, 0);
            assert.equal(member.meetings, 0);
            assert.equal(member.service_not_needed, common.getEventLength());
          });
        });
      });
    });

    // create status confirmed for event
    it('Create attendance event with status confirmed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then(() => {
          // assert that only the member service changed
          return models.Member.findById(common.getNormalUserEmail()).then((member) => {
            assert.equal(member.service, common.getEventLength());
            assert.equal(member.meetings, 0);
            assert.equal(member.service_not_needed, 0);
          });
        });
      });
    });

    // edit event status unconfirmed -> confirmed
    it('Edit attendance event status unconfirmed -> confirmed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusConfirmed(),
          }).then(() => {
            // assert that only the member service changed
            return models.Member.findById(common.getNormalUserEmail()).then((member) => {
              assert.equal(member.service, common.getEventLength());
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // edit status unconfirmed -> not needed
    it('Edit attendance event status unconfirmed -> not needed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusNotNeeded(),
          }).then(() => {
            // assert that only the member not needed service changed
            return models.Member.findById(common.getNormalUserEmail()).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, common.getEventLength());
            });
          });
        });
      });
    });

    // edit status unconfirmed -> unconfirmed
    it('Edit attendance status unconfirmed -> unconfirmed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusUnconfirmed(),
          }).then(() => {
            // assert that the member service didn't change
            return models.Member.findById(common.getNormalUserEmail()).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // edit status not needed -> unconfirmed

    // edit status not needed -> confirmed

    // edit status not needed -> not needed

    // edit status confirmed -> unconfirmed

    // edit status confirmed -> not needed

    // edit status confirmed -> confirmed


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

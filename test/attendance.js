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

  describe('Test attendance hooks for events', () => {
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

    // edit event status not needed -> confirmed
    it('Edit attendance event status not needed -> confirmed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
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

    // edit status not needed -> not needed
    it('Edit attendance event status not needed -> not needed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
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

    // edit status not needed -> unconfirmed
    it('Edit attendance status not needed -> unconfirmed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
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

    // edit event status confirmed -> confirmed
    it('Edit attendance event status not confirmed -> confirmed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
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

    // edit status confirmed -> not needed
    it('Edit attendance event status confirmed -> not needed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
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

    // edit status confirmed -> unconfirmed
    it('Edit attendance status confirmed -> unconfirmed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
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

    // delete unconfirmed attendance
    it('Delete attendance with status unconfirmed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then((attendance) => {
          return attendance.destroy().then(() => {
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

    // delete not needed attendance
    it('Delete attendance with status not needed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
        }).then((attendance) => {
          return attendance.destroy().then(() => {
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

    // delete confirmed attendance
    it('Delete attendance with status confirmed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then((attendance) => {
          return attendance.destroy().then(() => {
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
  });

  describe('Test attendance hooks for meetings', () => {
    // test confirmed for meeting
    it('Create attendance for meeting = confirmed', () => {
      return Promise.all([common.createMeeting(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then(() => {
          return models.Member.findById(common.getNormalUserEmail()).then((member) => {
            assert.equal(member.service, 0);
            assert.equal(member.meetings, 1);
            assert.equal(member.service_not_needed, 0);
          });
        });
      });
    });

    // test unconfirmed for meeting
    it('Create attendance for meeting = unconfirmed', () => {
      return Promise.all([common.createMeeting(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then(() => {
          return models.Member.findById(common.getNormalUserEmail()).then((member) => {
            assert.equal(member.service, 0);
            assert.equal(member.meetings, 0);
            assert.equal(member.service_not_needed, 0);
          });
        });
      });
    });

    // test not needed for meeting - should throw error
    it('Create attendance for meeting = not needed', () => {
      return Promise.all([common.createMeeting(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
        }).then(() => {
          assert(false, 'Create should have thrown an error for Not Needed Status');
        }).catch((err) => {
          assert(err);
        });
      });
    });

    // test delete confirmed meeting attendance
    it('Create delete attendance for meeting = confirmed', () => {
      return Promise.all([common.createMeeting(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then((attendance) => {
          return attendance.destroy().then(() => {
            return models.Member.findById(common.getNormalUserEmail()).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // test delete unconfirmed meeting attendance
    it('Create delete attendance for meeting = unconfirmed', () => {
      return Promise.all([common.createMeeting(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then((attendance) => {
          return attendance.destroy().then(() => {
            return models.Member.findById(common.getNormalUserEmail()).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // test meeting attendance unconfirmed -> confirmed
    it('Create delete attendance for meeting = unconfirmed -> confirmed', () => {
      return Promise.all([common.createMeeting(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusConfirmed(),
          }).then(() => {
            return models.Member.findById(common.getNormalUserEmail()).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 1);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // test meeting attendance confirmed -> unconfirmed
    it('Create delete attendance for meeting = confirmed -> unconfirmed', () => {
      return Promise.all([common.createMeeting(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusUnconfirmed(),
          }).then(() => {
            return models.Member.findById(common.getNormalUserEmail()).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // test meeting attendance confirmed -> not needed
    it('Create delete attendance for meeting = confirmed -> not needed', () => {
      return Promise.all([common.createMeeting(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_email: output[1].email,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusNotNeeded(),
          }).then(() => {
            assert(false, 'Update should have thrown an error.');
          }).catch((err) => {
            assert(err);
          });
        });
      });
    });
  });

  describe('Check Event hooks', () => {
    // test changing event times for unconfirmed attendance

    // test changing event times for not needed attendance

    // test changing event times for meeting

    // test deleting event for meeting

    // test deleting event for event
  });
});

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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then(() => {
          // assert that the member service didn't change
          return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
        }).then(() => {
          // assert that only the member not needed service changed
          return models.Member.findByPk(output[1].id).then((member) => {
            assert.equal(member.service, 0);
            assert.equal(member.meetings, 0);
            assert.equal(member.service_not_needed, common.getEventLength());
          });
        });
      });
    });

    // create status excused for event
    // it('Create event with status excused', () => {
    //   return Promise.all([common.createPublicEvent(),
    //     common.createNormalUser()]).then((output) => {
    //     // Create an attendance record
    //     return models.Attendance.create({
    //       member_id: output[1].id,
    //       event_id: output[0].id,
    //       status: models.Attendance.getStatusExcused(),
    //     }).then(() => {
    //       // assert that only the member service values don't change
    //       return models.Member.findByPk(output[1].id).then((member) => {
    //         assert.equal(member.service, 0);
    //         assert.equal(member.meetings, 0);
    //         assert.equal(member.service_not_needed, 0);
    //       });
    //     });
    //   });
    // });

    // create status confirmed for event
    it('Create attendance event with status confirmed', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // Create an attendance record
        return models.Attendance.create({
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then(() => {
          // assert that only the member service changed
          return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusConfirmed(),
          }).then(() => {
            // assert that only the member service changed
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusNotNeeded(),
          }).then(() => {
            // assert that only the member not needed service changed
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusUnconfirmed(),
          }).then(() => {
            // assert that the member service didn't change
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusConfirmed(),
          }).then(() => {
            // assert that only the member service changed
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusNotNeeded(),
          }).then(() => {
            // assert that only the member not needed service changed
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusUnconfirmed(),
          }).then(() => {
            // assert that the member service didn't change
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusConfirmed(),
          }).then(() => {
            // assert that only the member service changed
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusNotNeeded(),
          }).then(() => {
            // assert that only the member not needed service changed
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusUnconfirmed(),
          }).then(() => {
            // assert that the member service didn't change
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then((attendance) => {
          return attendance.destroy().then(() => {
            // assert that the member service didn't change
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
        }).then((attendance) => {
          return attendance.destroy().then(() => {
            // assert that the member service didn't change
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then((attendance) => {
          return attendance.destroy().then(() => {
            // assert that the member service didn't change
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then(() => {
          return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then(() => {
          return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then((attendance) => {
          return attendance.destroy().then(() => {
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then((attendance) => {
          return attendance.destroy().then(() => {
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusConfirmed(),
          }).then(() => {
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then((attendance) => {
          return attendance.update({
            status: models.Attendance.getStatusUnconfirmed(),
          }).then(() => {
            return models.Member.findByPk(output[1].id).then((member) => {
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
          member_id: output[1].id,
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
    it('Test changing times for unconfirmed attendance', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // create an attendance record
        return models.Attendance.create({
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then(() => {
          // change event length to 1/2 of what it was
          return output[0].update({
            end_time: output[0].start_time.getTime() + (common.getEventLength() / 2),
          }).then(() => {
            // it should not have changed the member because it was unconfirmed
            return models.Member.findByPk(output[1].id).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // test changing event times for not needed attendance
    it('Test changing times for not needed attendance', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // create an attendance record
        return models.Attendance.create({
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
        }).then(() => {
          // change event length to 1/2 of what it was
          return output[0].update({
            end_time: output[0].start_time.getTime() + (common.getEventLength() / 2),
          }).then(() => {
            // not needed time should have updated to be 1/2 of its previous value
            return models.Member.findByPk(output[1].id).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, (common.getEventLength() / 2));
            });
          });
        });
      });
    });

    // test changing time for confirmed attendance
    it('Test changing times for confirmed attendance', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // create an attendance record
        return models.Attendance.create({
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then(() => {
          // change event length to 1/2 of what it was
          return output[0].update({
            end_time: output[0].start_time.getTime() + (common.getEventLength() / 2),
          }).then(() => {
            // service should now be 1/2 of event length
            return models.Member.findByPk(output[1].id).then((member) => {
              assert.equal(member.service, (common.getEventLength() / 2));
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // test changing event times for meeting
    it('Test changing times for confirmed attendance to meeting', () => {
      return Promise.all([common.createMeeting(), common.createNormalUser()]).then((output) => {
        // create an attendance record
        return models.Attendance.create({
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then(() => {
          // change event length to 1/2 of what it was
          return output[0].update({
            end_time: output[0].start_time.getTime() + (common.getEventLength() / 2),
          }).then(() => {
            // changing event times should not impact meetings
            return models.Member.findByPk(output[1].id).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 1);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // test deleting event for unconfirmed event
    it('Test deleting event for unconfirmed event', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // create an attendance record
        return models.Attendance.create({
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then(() => {
          return output[0].destroy().then(() => {
            // unconfirmed status should see no difference
            return models.Member.findByPk(output[1].id).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // test deleting event for confirmed event
    it('Test deleting event for confirmed event', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // create an attendance record
        return models.Attendance.create({
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then(() => {
          return output[0].destroy().then(() => {
            // everything should be 0
            return models.Member.findByPk(output[1].id).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // test deleting event for not needed event
    it('Test deleting event for not needed event', () => {
      return Promise.all([common.createPublicEvent(), common.createNormalUser()]).then((output) => {
        // create an attendance record
        return models.Attendance.create({
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusNotNeeded(),
        }).then(() => {
          return output[0].destroy().then(() => {
            // everything should be 0
            return models.Member.findByPk(output[1].id).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // test deleting event for confirmed meeting
    it('Test deleting event for confirmed meeting', () => {
      return Promise.all([common.createMeeting(), common.createNormalUser()]).then((output) => {
        // create an attendance record
        return models.Attendance.create({
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then(() => {
          return output[0].destroy().then(() => {
            // changing event times should not impact meetings
            return models.Member.findByPk(output[1].id).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });

    // test deleting event for unconfirmed meeting
    it('Test deleting event for unconfirmed meeting', () => {
      return Promise.all([common.createMeeting(), common.createNormalUser()]).then((output) => {
        // create an attendance record
        return models.Attendance.create({
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusUnconfirmed(),
        }).then(() => {
          return output[0].destroy().then(() => {
            // changing event times should not impact meetings
            return models.Member.findByPk(output[1].id).then((member) => {
              assert.equal(member.service, 0);
              assert.equal(member.meetings, 0);
              assert.equal(member.service_not_needed, 0);
            });
          });
        });
      });
    });
  });

  describe('Verify behavior of bulk hooks', () => {
    // bulk hooks should trigger individual hooks
    // I'm not going to test all of them, but this will verify library behavior
    it('Test bulk destroy hook', () => {
      return Promise.all([common.createMeeting(), common.createNormalUser()]).then((output) => {
        // create an attendance record
        return models.Attendance.create({
          member_id: output[1].id,
          event_id: output[0].id,
          status: models.Attendance.getStatusConfirmed(),
        }).then(() => {
          // calling destroy on the attendance model instead of an instance is a bulk operation
          // if the model is correctly configured, this should result in the individual hook
          // being called anyways
          return models.Attendance.destroy({
            where: {
              event_id: output[0].id,
              member_id: output[1].id,
            },
          }).then(() => {
            return models.Member.findByPk(output[1].id).then((member) => {
              assert.equal(member.meetings, 0);
            });
          });
        });
      });
    });

    it('Test bulk update hook', () => {
      // we'll need a second member to test bulk updates
      const member2Email = 'normal2@mail.uc.edu';
      const member2Promise = models.Member.create({
        email: member2Email,
        password: 'blah', // we won't be logging in, so this doesn't matter
        accend: false,
        super_user: false,
        private_user: false,
      });
      return Promise.all([common.createMeeting(), common.createNormalUser(), member2Promise])
        .then((output) => {
          // create attendance records
          const attend1Prom = models.Attendance.create({
            member_id: output[1].id,
            event_id: output[0].id,
            status: models.Attendance.getStatusUnconfirmed(),
          });

          const attend2Prom = models.Attendance.create({
            member_id: output[2].id,
            event_id: output[0].id,
            status: models.Attendance.getStatusUnconfirmed(),
          });

          return Promise.all([attend1Prom, attend2Prom]).then(() => {
            return models.Attendance.update({
              status: models.Attendance.getStatusConfirmed(),
            },
            {
              where: {
                event_id: output[0].id,
              },
            }).then((rowsModified) => {
              assert.equal(rowsModified.length, 2);
              // assert that meetings are now 1 in both cases
              return models.Member.findAll().then((members) => {
                assert.equal(members.length, 2);
                assert.equal(members[0].meetings, 1);
                assert.equal(members[1].meetings, 1);
              });
            });
          });
        });
    });

    // test bulkCreateHook
    it('Test bulkCreate hook', () => {
      // we'll need a second member to test bulk updates
      const member2Email = 'normal2@mail.uc.edu';
      const member2Promise = models.Member.create({
        email: member2Email,
        password: 'blah', // we won't be logging in, so this doesn't matter
        accend: false,
        super_user: false,
        private_user: false,
      });
      return Promise.all([common.createMeeting(), common.createNormalUser(), member2Promise])
        .then((output) => {
          // bulk create the attendance records
          return models.Attendance.bulkCreate([
            {
              status: models.Attendance.getStatusConfirmed(),
              event_id: output[0].id,
              member_id: output[1].id,
            }, {
              status: models.Attendance.getStatusConfirmed(),
              event_id: output[0].id,
              member_id: output[2].id,
            }]).then(() => {
            // assert that meetings are now 1 in both cases
            return models.Member.findAll().then((members) => {
              assert.equal(members.length, 2);
              assert.equal(members[0].meetings, 1);
              assert.equal(members[1].meetings, 1);
            });
          });
        });
    });
  });
});

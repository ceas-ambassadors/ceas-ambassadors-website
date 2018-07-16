/* eslint-disable no-use-before-define */
/* http://docs.sequelizejs.com/manual/tutorial/associations.html#belongs-to-many-associations */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    status: {
      type: DataTypes.ENUM('unconfirmed', 'confirmed', 'not_needed'),
      allowNull: false,
    },
    // This also has references to an event and a member - auto added as part of
    // the association process in the event and member model definitions
    // They are:
    // event_id - int(11)
    // member_email - varchar(255)
  }, {
    // set so that all autocreated table names are underscored instead of camel cased
    underscored: true,
    hooks: {
      afterCreate: (attendance /* , options */) => {
        return updateMemberColumns(attendance, false);
      },
      afterUpdate: (attendance /* , options */) => {
        return updateMemberColumns(attendance, false);
      },
      afterUpsert: (attendance /* , options */) => {
        return updateMemberColumns(attendance, false);
      },
      beforeDestroy: (attendance /* , options */) => {
        return updateMemberColumns(attendance, true);
      },
    },
  });
  Attendance.associate = (/* models */) => {
    // associations can be defined here
  };

  /**
   * Define enum values for different status enum values
   * THESE MUST MATCH THE ABOVE DEFINED
   */
  Attendance.getStatusUnconfirmed = () => { return 'unconfirmed'; };
  Attendance.getStatusConfirmed = () => { return 'confirmed'; };
  Attendance.getStatusNotNeeded = () => { return 'not_needed'; };

  /**
   * This is a function to be called from hooks, in which the given attendance is
   * applied to a member's columns reflecting their hours
   * @param {*} attendance - the attendance record passed in from the hook
   */
  const updateMemberColumns = (attendance, remove) => {
    // if status is unconfirmed take no action
    if (attendance.status === Attendance.getStatusUnconfirmed()) {
      // Resolve an empty promise so that this function has a consistent return value
      return Promise.resolve();
    }
    const eventPromise = sequelize.models.Event.findById(attendance.event_id);

    const memberPromise = sequelize.models.Member.findById(attendance.member_email);

    return Promise.all([eventPromise, memberPromise]).then((output) => {
      // Output is in order of input array
      const event = output[0];
      const member = output[1];
      let length = event.end_time - event.start_time;
      if (remove) {
        length *= -1;
      }
      if (attendance.status === Attendance.getStatusConfirmed()) {
        if (event.meeting) {
          // its a meeting, so update the meetings column
          if (remove) {
            // Remove the meeting
            return member.update({
              meetings: member.meetings - 1,
            });
          }
          return member.update({
            meetings: member.meetings + 1,
          });
        }
        // not a meeting
        return member.update({
          service: member.service + length,
        });
      }
      if (attendance.status === Attendance.getStatusNotNeeded()) {
        return member.update({
          service_not_needed: member.service_not_needed + length,
        });
      }
      throw Error('Something unexpected happened in the attendance update member columns function');
    });
  };
  return Attendance;
};

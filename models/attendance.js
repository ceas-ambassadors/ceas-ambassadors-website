/* eslint-disable no-use-before-define */
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint-disable no-underscore-dangle */ // Needed for sequelize
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
      beforeUpsert: () => {
        // Disallow upserts because they're difficult to support with our hook ecosystem
        throw Error('Upserts are difficult to support for attendance.');
      },
      afterCreate: (attendance /* , options */) => {
        // afterCreate only cares to add the event to the appropriate columns because there is
        // no previous data to remove
        // this code is very simple to beforeDestroy hook
        if (attendance.status === Attendance.getStatusUnconfirmed()) {
          // No action needed. Resolve with empty promise for consistent return value
          return Promise.resolve();
        }
        const eventPromise = sequelize.models.Event.findById(attendance.event_id);

        const memberPromise = sequelize.models.Member.findById(attendance.member_email);

        return Promise.all([eventPromise, memberPromise]).then((output) => {
          const event = output[0];
          const member = output[1];
          if (event.meeting) {
            // event is a meeting, so add to the meeting field
            if (attendance.status === Attendance.getStatusConfirmed()) {
              return member.update({
                meetings: member.meetings + 1,
              });
            }
            // If the code gets this far, the status is not needed, which is not allowed
            throw Error('Not Needed is not an allowable state for meeting attendance records.');
          }
          const length = event.end_time - event.start_time;
          if (attendance.status === Attendance.getStatusConfirmed()) {
            return member.update({
              service: member.service + length,
            });
          }
          if (attendance.status === Attendance.getStatusNotNeeded()) {
            return member.update({
              service_not_needed: member.service_not_needed + length,
            });
          }
          throw Error('Something unexpected happened in the attendance afterCreate hook.');
        });
      },
      afterUpdate: (attendance /* , options */) => {
        // This hook removes the effects of the old status and applies the effects of the new status
        const oldStatus = attendance._previousDataValues.status;
        // no action necessary if old status is new status
        if (oldStatus === attendance.status) {
          // Resolve an empty promise so that this function has a consistent return value
          return Promise.resolve();
        }

        const eventPromise = sequelize.models.Event.findById(attendance.event_id);

        const memberPromise = sequelize.models.Member.findById(attendance.member_email);

        return Promise.all([eventPromise, memberPromise]).then((output) => {
          const event = output[0];
          const member = output[1];
          if (event.meeting) {
            // The event is a meeting
            let meetingsChange = 0;
            // no action if oldStatus = unconfirmed
            // no action if new status = unconfirmed
            if (oldStatus === Attendance.getStatusConfirmed()) {
              meetingsChange -= 1;
            }
            if (attendance.status === Attendance.getStatusConfirmed()) {
              meetingsChange += 1;
            }
            // meetings cannot be not needed
            if (oldStatus === Attendance.getStatusNotNeeded()
                || attendance.status === Attendance.getStatusNotNeeded()) {
              throw Error('Not needed is an invalid state for an attendance status for a meeting.');
            }
            return member.update({
              meetings: member.meetings + meetingsChange,
            });
          }
          // Not a meeting
          const length = event.end_time - event.start_time;
          let serviceChange = 0;
          let serviceNotNeededChange = 0;
          // no change if old status = unconfirmed
          if (oldStatus === Attendance.getStatusConfirmed()) {
            serviceChange -= length;
          }
          if (oldStatus === Attendance.getStatusNotNeeded()) {
            serviceNotNeededChange -= length;
          }
          // no change if status = unconfirme
          if (attendance.status === Attendance.getStatusConfirmed()) {
            serviceChange += length;
          }
          if (attendance.status === Attendance.getStatusNotNeeded()) {
            serviceNotNeededChange += length;
          }
          return member.update({
            service: member.service + serviceChange,
            service_not_needed: member.service_not_needed + serviceNotNeededChange,
          });
        });
      },
      beforeDestroy: (attendance /* , options */) => {
        // This hook removes the current status effects from the member columns
        // It is very similar to the code found in the afterCreate hook
        if (attendance.status === Attendance.getStatusUnconfirmed()) {
          // No action needed. Resolve with empty promise for consistent return value
          return Promise.resolve();
        }
        const eventPromise = sequelize.models.Event.findById(attendance.event_id);

        const memberPromise = sequelize.models.Member.findById(attendance.member_email);

        return Promise.all([eventPromise, memberPromise]).then((output) => {
          const event = output[0];
          const member = output[1];
          if (event.meeting) {
            // event is a meeting, so remove from the meeting field
            if (attendance.status === Attendance.getStatusConfirmed()) {
              return member.update({
                meetings: member.meetings - 1,
              });
            }
            // If the code gets this far, the status is not needed, which is not allowed
            throw Error('Not Needed is not an allowable state for meeting attendance records.');
          }
          const length = event.end_time - event.start_time;
          if (attendance.status === Attendance.getStatusConfirmed()) {
            return member.update({
              service: member.service - length,
            });
          }
          if (attendance.status === Attendance.getStatusNotNeeded()) {
            return member.update({
              service_not_needed: member.service_not_needed - length,
            });
          }
          throw Error('Something unexpected happened in the attendance afterCreate hook.');
        });
      },
      beforeBulkCreate: (options) => {
        // call individual hooks for each created record
        options.individualHooks = true;
      },
      beforeBulkDestroy: (options) => {
        // call individual hooks for each record destroyed
        options.individualHooks = true;
      },
      beforeBulkUpdate: (options) => {
        // call individual hooks for each record updated
        options.individualHooks = true;
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

  return Attendance;
};

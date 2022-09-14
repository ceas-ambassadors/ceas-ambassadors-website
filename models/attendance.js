/* eslint-disable no-use-before-define */
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint-disable no-underscore-dangle */ // Needed for sequelize
/* http://docs.sequelizejs.com/manual/tutorial/associations.html#belongs-to-many-associations */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    status: {
      type: DataTypes.ENUM('unconfirmed', 'confirmed', 'not_needed', 'excused'),
      allowNull: false,
    },
    // This also has references to an event and a member - auto added as part of
    // the association process in the event and member model definitions
    // They are:
    // event_id - int(11)
    // member_id - int(11)
  }, {
    // set so that all autocreated table names are underscored instead of camel cased
    underscored: true,
    // manually name our table. the use of the 'underscored' option would
    // decapitilize the first word.
    tableName: 'Attendances',
    hooks: {
      beforeUpsert: () => {
        // Disallow upserts because they're difficult to support with our hook ecosystem
        throw Error('Upserts are difficult to support for attendance.');
      },
      beforeCreate: (attendance /* , options */) => {
        // validate that if the event is a meeting, it isn't a not_needed record
        return sequelize.models.Event.findByPk(attendance.event_id).then((event) => {
          if (event.meeting && attendance.status === Attendance.getStatusNotNeeded()) {
            throw Error('Meetings cannot have not needed status.');
          }
          if (event.meeting && attendance.status === Attendance.getStatusExcused()) {
            throw Error('Meetings cannot have excused status.');
          }
        });
      },
      beforeUpdate: (attendance /* , options */) => {
        // validate that if the event is a meeting, it isn't being updated to a not_needed record
        return sequelize.models.Event.findByPk(attendance.event_id).then((event) => {
          if (event.meeting && attendance.status === Attendance.getStatusNotNeeded()) {
            throw Error('Meetings cannot have not needed status.');
          }
          if (event.meeting && attendance.status === Attendance.getStatusExcused()) {
            throw Error('Meetings cannot have excused status.');
          }
        });
      },
      afterCreate: (attendance /* , options */) => {
        // afterCreate only cares to add the event to the appropriate columns because there is
        // no previous data to remove
        // this code is very simple to beforeDestroy hook
        if (attendance.status === Attendance.getStatusUnconfirmed()) {
          // No action needed. Resolve with empty promise for consistent return value
          return Promise.resolve();
        }
        const eventPromise = sequelize.models.Event.findByPk(attendance.event_id);

        const memberPromise = sequelize.models.Member.findByPk(attendance.member_id);

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

        const eventPromise = sequelize.models.Event.findByPk(attendance.event_id);

        const memberPromise = sequelize.models.Member.findByPk(attendance.member_id);

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
            // meetings cannot be excused
            if (oldStatus === Attendance.getStatusExcused()
                || attendance.status === Attendance.getStatusExcused()) {
              throw Error('Excused is an invalid state for an attendance status for a meeting.');
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
          // no change if status = unconfirmed
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
        const eventPromise = sequelize.models.Event.findByPk(attendance.event_id);

        const memberPromise = sequelize.models.Member.findByPk(attendance.member_id);

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
      beforeBulkCreate: (instances, options) => {
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
  Attendance.getStatusExcused = () => { return 'excused'; };

  return Attendance;
};

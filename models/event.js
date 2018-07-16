/* eslint-disable no-use-before-define */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    meeting: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    // set so that all autocreated table names are underscored instead of camel cased
    underscored: true,
    hooks: {
      beforeUpdate: (event) => {
        return handleEventUpdateOnAttendance(event, true);
      },
      afterUpdate: (event) => {
        return handleEventUpdateOnAttendance(event, false);
      },
      beforeDestroy: (event) => {
        // Destroy all attendance records which now correspond to the dead event
        /**
         * TODO: verify that this works - the question here is - what happens first?
         * The attendance model should handle deducting deleted events when it's destroy hook is hit
         * but, if the event doesn't exist by the time that hook gets called, it could cause errors
         * but, if I handle it here, then the deduction would be duplicated
         * One possible action is adding a feux deletion column - something that denotes
         * that the attendance record has been deleted, without actually deleting it
         */
        return sequelize.models.Attendance.findAll({
          where: {
            event_id: event.id,
          },
        }).then((attendances) => {
          const promises = [];
          for (let i = 0; i < attendances.length; i += 1) {
            promises.push(attendances[i].destroy());
          }
          return Promise.all(promises);
        });
      },
    },
  });
  Event.associate = (models) => {
    // associations can be defined here
    models.Event.belongsToMany(models.Member, {
      as: 'event_id',
      through: models.Attendance,
    });
    models.Event.belongsTo(models.Member);
  };

  /**
   * if the length of the event changes it needs to be reflected in member accounts who have
   * been confirmed for attending it
   * This function handles both before update and after update - it always adds the length of the
   * event, but the length is negative if it is before the update.
   * This is done this way because it isn't possible to track the old values of start and end and
   * compare them to the current values of start and end. The good thing is that this code is
   * asynchronous and it therefore doesn't actually matter the order in which the before and end
   * are executed if the before takes too long and regardless, the asynchronous nature will stop
   * this from blocking a server to client response.
   * @param {*} event - the event that has changed
   * @param {*} deduct - should the length of the event be removed or added to the appropriate
   *                     column
   */
  const handleEventUpdateOnAttendance = (event, deduct) => {
    // Meetings don't reflect time lengths so unimportant
    if (event.meeting) {
      return Promise.resolve();
    }

    return sequelize.models.Attendance.findAll({
      where: {
        event_id: event.id,
      },
    }).then((attendances) => {
      const promises = [];
      for (let i = 0; i < attendances.length; i += 1) {
        promises.push(sequelize.models.findById(attendances[i].member_email));
      }
      return Promise.all(promises).then((output) => {
        const returns = []; // array of actions for return
        let length = event.end_time - event.start_time;
        if (deduct) {
          length *= -1;
        }
        // each attendance refers to a single member, so the two arrays are synced
        for (let i = 0; i < output.length; i += 1) {
          if (attendances[i].status === sequelize.models.Attendance.getStatusConfirmed()) {
            returns.push(output[i].update({
              service: output[i].service + length,
            }));
          }
          if (attendances[i].status === sequelize.models.Attendance.getStatusNotNeeded()) {
            returns.push(output[i].update({
              service_not_needed: output[i].service_not_needed + length,
            }));
          }
        }
        return Promise.all(returns);
      });
    });
  };
  return Event;
};

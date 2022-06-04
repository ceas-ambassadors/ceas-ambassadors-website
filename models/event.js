/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */ // Needed for sequelize
/* eslint no-param-reassign: ["error", { "props": false }] */

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
    is_disabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    // also created_by - defined below in associations
  }, {
    // set so that all autocreated table names are underscored instead of camel cased
    underscored: true,
    // manually name the table, the use of the 'underscored' option would
    // rename it without a capital letter
    tableName: 'Events',
    hooks: {
      // http://docs.sequelizejs.com/manual/tutorial/hooks.html
      beforeUpsert: () => {
        throw Error('Upsert is hard to support for events.');
      },
      beforeDestroy: (event) => {
        // Need to manually destroy related attendance records so that the right hooks are called
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
      afterUpdate: (event) => {
        /**
         * if the length of the event changes it needs to be reflected in member accounts who have
         * been confirmed for attending it
         * This code is relatively slow because of how much it could have to do, but because
         * the server is asynchronous it should not matter
         * This code is very clearly a bottleneck for the site if it got to the point where
         * a lot of members were signing up for the same changed event (hundreds/thousands +)
         */
        // Meetings don't reflect time lengths so unimportant
        if (event.meeting) {
          // return promise for consistent return value
          return Promise.resolve();
        }

        const lengthChange = (event.end_time - event.start_time)
          - (event._previousDataValues.end_time - event._previousDataValues.start_time);
        if (lengthChange === 0) {
          // The time didn't change, so it is unnecessary to actually process all these members
          // return promise for consistent return value
          return Promise.resolve();
        }

        return sequelize.models.Attendance.findAll({
          where: {
            event_id: event.id,
          },
        }).then((attendances) => {
          const promises = [];
          for (let i = 0; i < attendances.length; i += 1) {
            promises.push(sequelize.models.Member.findByPk(attendances[i].member_id));
          }
          return Promise.all(promises).then((output) => {
            const returns = []; // array of actions for return
            // each attendance refers to a single member, so the two arrays are synced
            for (let i = 0; i < output.length; i += 1) {
              if (attendances[i].status === sequelize.models.Attendance.getStatusConfirmed()) {
                returns.push(output[i].update({
                  service: output[i].service + lengthChange,
                }));
              }
              if (attendances[i].status === sequelize.models.Attendance.getStatusNotNeeded()) {
                returns.push(output[i].update({
                  service_not_needed: output[i].service_not_needed + lengthChange,
                }));
              }
            }
            return Promise.all(returns);
          });
        });
      },
      // beforeDestroy: - this is handled by cascading deletes and ensuring hooks are called
      // see options in Event.associate()
      beforeBulkDestroy: (options) => {
        // make it so that individual hooks are called for each destroyed row
        options.individualHooks = true;
      },
      beforeBulkUpdate: (options) => {
        // call beforeUpdate for each individual record
        options.individualHooks = true;
      },
    },
  });
  Event.associate = (models) => {
    // associations can be defined here
    models.Event.belongsToMany(models.Member, {
      as: 'event_id',
      foreignKey: 'event_id', // names what the column appears as in code
      through: models.Attendance,
      hooks: true,
    });
    // created_by - id of member who created event
    models.Event.belongsTo(models.Member, { foreignKey: 'created_by' });
  };

  return Event;
};

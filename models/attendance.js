/* http://docs.sequelizejs.com/manual/tutorial/associations.html#belongs-to-many-associations */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    status: {
      type: DataTypes.ENUM('unconfirmed', 'confirmed', 'not_needed', 'meeting'),
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
  Attendance.getStatusMeeting = () => { return 'meeting'; };

  return Attendance;
};

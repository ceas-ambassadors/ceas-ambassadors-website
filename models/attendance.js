/* http://docs.sequelizejs.com/manual/tutorial/associations.html#belongs-to-many-associations */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define('Attendance', {
    status: DataTypes.ENUM('unconfirmed', 'confirmed', 'not_needed', 'meeting'),
    // This also has references to an event and a member
  }, {});
  Attendance.associate = (/* models */) => {
    // associations can be defined here
  };
  return Attendance;
};

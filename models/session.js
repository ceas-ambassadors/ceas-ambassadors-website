/**
 * Definition of session table - duplicated from https://github.com/mweibel/connect-session-sequelize/blob/master/lib/model.js
 * because it'll be useful to have an accessible table
 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    sid: {
      type: DataTypes.STRING(32),
      primaryKey: true,
    },
    expires: DataTypes.DATE,
    data: DataTypes.TEXT,
  }, {
    // set so that all autocreated table names are underscored
    // underscored: true,
  });
  return Session;
};

/**
 * Definition of session table - duplicated from https://github.com/mweibel/connect-session-sequelize/blob/master/lib/model.js
 * because it'll be useful to have an accessible table
 * It's worth noting that this doesn't follow all the conventions that 
 * the other tables follow because doing so would not work with the module that
 * uses this table
 */

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    sid: {
      type: DataTypes.STRING(36),
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


'use strict';

module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    title: DataTypes.STRING,
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    description: DataTypes.TEXT,
    location: DataTypes.STRING,
    public: DataTypes.BOOLEAN,
    meeting: DataTypes.BOOLEAN,
  }, {});
  Event.associate = (models) => {
    // associations can be defined here
    models.Event.belongsToMany(models.Member, { through: models.Attendance });
  };
  return Event;
};

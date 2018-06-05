
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
  });
  Event.associate = (models) => {
    // associations can be defined here
    models.Event.belongsToMany(models.Member, {
      as: 'event_id',
      through: models.Attendance,
    });
    models.Event.belongsTo(models.Member);
  };
  return Event;
};

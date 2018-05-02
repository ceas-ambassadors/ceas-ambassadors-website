
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    email: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    major: DataTypes.STRING,
    grad_year: DataTypes.INTEGER,
    minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    meetings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    minutes_not_needed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    path_to_picture: DataTypes.STRING,
    clubs: DataTypes.TEXT,
    minors: DataTypes.STRING,
    accend: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    hometown: DataTypes.STRING,
    coops: DataTypes.TEXT,
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    super_user: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    private_user: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    // set so that all autocreated table names are underscored instead of camel cased
    underscored: true,
  });
  Member.associate = (models) => {
    // associations can be defined here
    models.Member.belongsToMany(models.Event, {
      as: 'member_email',
      through: models.Attendance,
    });
  };
  return Member;
};

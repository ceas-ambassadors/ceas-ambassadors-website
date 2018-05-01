
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    email: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    major: DataTypes.STRING,
    grad_year: DataTypes.INTEGER,
    minutes: DataTypes.INTEGER,
    meetings: DataTypes.INTEGER,
    minutes_sent_home: DataTypes.INTEGER,
    path_to_picture: DataTypes.STRING,
    clubs: DataTypes.STRING,
    minors: DataTypes.STRING,
    accend: DataTypes.BOOLEAN,
    hometown: DataTypes.STRING,
    coops: DataTypes.STRING,
    password: DataTypes.STRING,
    super_user: DataTypes.BOOLEAN,
    private_user: DataTypes.BOOLEAN,
  }, {});
  Member.associate = (models) => {
    // associations can be defined here
    models.Member.belongsToMany(models.Event, { through: models.Attendance });
  };
  return Member;
};

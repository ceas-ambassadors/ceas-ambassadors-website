
'use strict';

const bcrypt = require('bcrypt');

// the number of rounds the salt will be generated
const saltRounds = 10;

module.exports = (sequelize, DataTypes) => {
  const Member = sequelize.define('Member', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    major: DataTypes.STRING,
    grad_year: DataTypes.INTEGER,
    service: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    meetings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    service_not_needed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_certified: {
      type: DataTypes.BOOLEAN,
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
    // manually name the table. the use of 'underscored' would change the name
    // to not have a capital letter
    tableName: 'Members',
  });
  Member.associate = (models) => {
    // associations can be defined here
    models.Member.belongsToMany(models.Event, {
      as: 'member_id',
      foreignKey: 'member_id', // names what the column appears as in code
      through: models.Attendance,
    });
  };

  /**
   * Generate password hash - returns promise of hash
   * @param password - the plaintext password to be hashed
   * @return promise function(hash) = password hash
   */
  Member.generatePasswordHash = (password) => {
    return bcrypt.hash(password, saltRounds);
  };

  /**
   * Compare password hash - returns promise of result
   * @param password - the plaintext password to be compared
   * @param member - the member to compare the hashed password to
   * @return promise function(res) = true/false
   */
  Member.comparePassword = (password, member) => {
    return bcrypt.compare(password, member.password);
  };

  return Member;
};

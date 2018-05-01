/* eslint-disable */
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Members', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      major: {
        type: Sequelize.STRING
      },
      grad_year: {
        type: Sequelize.INTEGER
      },
      minutes: {
        type: Sequelize.INTEGER
      },
      meetings: {
        type: Sequelize.INTEGER
      },
      minutes_sent_home: {
        type: Sequelize.INTEGER
      },
      path_to_picture: {
        type: Sequelize.STRING
      },
      clubs: {
        type: Sequelize.STRING
      },
      minors: {
        type: Sequelize.STRING
      },
      accend: {
        type: Sequelize.BOOLEAN
      },
      hometown: {
        type: Sequelize.STRING
      },
      coops: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      super_user: {
        type: Sequelize.BOOLEAN
      },
      private_user: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Members');
  }
};
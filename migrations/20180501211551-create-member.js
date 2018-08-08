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
        type: Sequelize.STRING,
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING,
      },
      last_name: {
        type: Sequelize.STRING,
      },
      major: {
        type: Sequelize.STRING,
      },
      grad_year: {
        type: Sequelize.INTEGER,
      },
      service: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      meetings: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      service_not_needed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      path_to_picture: {
        type: Sequelize.STRING,
      },
      clubs: {
        type: Sequelize.TEXT,
      },
      minors: {
        type: Sequelize.STRING,
      },
      accend: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      hometown: {
        type: Sequelize.STRING,
      },
      coops: {
        type: Sequelize.TEXT,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      super_user: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      private_user: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Members');
  }
};
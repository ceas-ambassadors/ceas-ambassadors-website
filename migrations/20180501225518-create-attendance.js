/* eslint-disable */
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Attendances', {
      event_id: {
        type: Sequelize.INT,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Events',
          key: 'id',
        },
      },
      member_id: {
        type: Sequelize.INT,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'Members',
          key: 'id',
        },
      },
      status: {
        type: Sequelize.ENUM('unconfirmed', 'confirmed', 'not_needed'),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Attendances');
  }
};
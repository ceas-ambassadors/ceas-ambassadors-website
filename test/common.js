/**
 * For the definition of functions used across tests
 */
process.env.NODE_ENV = 'test';
const models = require('../models');
// const request = require('supertest');
// const app = require('../app.js');

const clearDatabase = () => {
  // tests start so quick after the app code is loaded
  // that sequelize hasn't had a chance to create all tables
  // so force sync it to make sure all tables are there
  return models.sequelize.sync().then(() => {
    const memberPromise = models.Member.destroy({
      where: {},
    });
    const sessionPromise = models.Session.destroy({
      where: {},
    });
    const eventPromise = models.Event.destroy({
      where: {},
    });
    const attendancePromise = models.Attendance.destroy({
      where: {},
    });
    return Promise.all([memberPromise, sessionPromise, eventPromise, attendancePromise]);
  });
};
exports.clearDatabase = clearDatabase;

/**
 * Creates a normal user and signs them in, creating a user session
 * @param {*} done
 */
const createNormalUserSession = (agent) => {
  return models.Member.generatePasswordHash('password').then((passwordHash) => {
    return models.Member.create({
      email: 'normal@kurtjlewis.com',
      password: passwordHash,
      accend: false,
      super_user: false,
      private_user: false,
    }).then(() => {
      return agent
        .post('/login')
        .send({
          email: 'normal@kurtjlewis.com',
          password: 'password',
        })
        .redirects(1)
        .expect(200);
    });
  });
};
exports.createNormalUserSession = createNormalUserSession;

/**
 * Create a non-meeting event
 */
const createPublicEvent = () => {
  return models.Event.create({
    title: 'Test Meeting',
    start_time: Date.now(),
    end_time: Date.now() + 100,
    location: 'Your computer',
    public: true,
    meeting: false,
    created_by: 'test@kurtjlewis.com',
  });
};
exports.createPublicEvent = createPublicEvent;

/**
 * Create a non-meeting private event
 */
const createPrivateEvent = () => {
  return models.Event.create({
    title: 'Test Meeting',
    start_time: Date.now(),
    end_time: Date.now() + 100,
    location: 'Your computer',
    public: false,
    meeting: false,
    created_by: 'test@kurtjlewis.com',
  });
};
exports.createPrivateEvent = createPrivateEvent;

/**
 * Create a meeting event
 */
const createMeeting = () => {
  return models.Event.create({
    title: 'Test Meeting',
    start_time: Date.now(),
    end_time: Date.now() + 100,
    location: 'Your computer',
    public: true,
    meeting: true,
    created_by: 'test@kurtjlewis.com',
  });
};
exports.createMeeting = createMeeting;

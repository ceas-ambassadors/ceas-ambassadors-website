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

const getNormalUserEmail = () => {
  return 'normal@kurtjlewis.com';
};
exports.getNormalUserEmail = getNormalUserEmail;

/**
 * Creates a normal user
 */
const createNormalUser = () => {
  return models.Member.generatePasswordHash('password').then((passwordHash) => {
    return models.Member.create({
      email: getNormalUserEmail(),
      password: passwordHash,
      accend: false,
      super_user: false,
      private_user: false,
    });
  });
};
exports.createNormalUser = createNormalUser;

/**
 * Creates a normal user and signs them in, creating a user session
 * @param {*} done
 */
const createNormalUserSession = (agent) => {
  return createNormalUser().then((member) => {
    return agent
      .post('/login')
      .send({
        email: member.email,
        password: 'password',
      })
      .redirects(1)
      .expect(200);
  });
};
exports.createNormalUserSession = createNormalUserSession;

/**
 * get standard length of event
 */
const getEventLength = () => {
  // Events are one hour long
  return 3600000;
};

exports.getEventLength = getEventLength;

/**
 * Create a non-meeting event
 */
const createPublicEvent = () => {
  // create date and set it 1 hour in the future
  const date = Date.now() + getEventLength();
  return models.Event.create({
    title: 'Test Meeting',
    start_time: date,
    end_time: date + getEventLength(),
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
  // create date and set it 1 hour in the future
  const date = Date.now() + getEventLength();
  return models.Event.create({
    title: 'Test Meeting',
    start_time: date,
    end_time: date + getEventLength(),
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
  // create date and set it 1 hour in the future
  const date = Date.now() + getEventLength();
  return models.Event.create({
    title: 'Test Meeting',
    start_time: date,
    end_time: date + getEventLength(),
    location: 'Your computer',
    public: true,
    meeting: true,
    created_by: 'test@kurtjlewis.com',
  });
};
exports.createMeeting = createMeeting;

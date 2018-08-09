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
    // all attendance records are deleted when their corresponding events are deleted
    // const attendancePromise = models.Attendance.destroy({
    //   where: {},
    // });
    return Promise.all([memberPromise, sessionPromise, eventPromise]);
  });
};
exports.clearDatabase = clearDatabase;

const getNormalUserEmail = () => {
  return 'normal@mail.uc.edu';
};
exports.getNormalUserEmail = getNormalUserEmail;

const getSuperUserEmail = () => {
  return 'super@mail.uc.edu';
};
exports.getSuperUserEmail = getSuperUserEmail;

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
 * Creates a super user
 */
const createSuperUser = () => {
  return models.Member.generatePasswordHash('password').then((passwordHash) => {
    return models.Member.create({
      email: getSuperUserEmail(),
      password: passwordHash,
      accend: false,
      super_user: true,
      private_user: false,
    });
  });
};
exports.createSuperUser = createSuperUser;

/**
 * Creates a normal user and signs them in, creating a user session
 * @param {*} member - the member to create a session for
 * @param {*} agent - superagent instance to log in
 */
const createUserSession = (member, agent) => {
  return agent
    .post('/login')
    .send({
      email: member.email,
      password: 'password',
    })
    .redirects(1) 
    .expect(200);
};
exports.createUserSession = createUserSession;

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
  });
};
exports.createMeeting = createMeeting;

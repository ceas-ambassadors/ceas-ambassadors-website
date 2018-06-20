/**
 * For the definition of functions used across tests
 */
const models = require('../models');

const clearDatabase = (done) => {
  const memberPromise = models.Member.destroy({
    where: {},
  });
  const sessionPromise = models.Session.destroy({
    where: {},
  });
  Promise.all([memberPromise, sessionPromise]).then(() => {
    done();
  });
};
exports.clearDatabase = clearDatabase;

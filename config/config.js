module.exports = {
  development: {
    url: process.env.DEV_DB_URL,
    dialect: 'mysql',
  },
  test: {
    url: process.env.TEST_DB_URL,
    dialect: 'mysql',
  },
  production: {
    url: process.env.PROD_DB_URL,
    dialect: 'mysql',
  },
};

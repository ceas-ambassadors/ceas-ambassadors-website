module.exports = {
  development: {
    url: process.env.DEV_DB_URL,
    dialect: 'mysql',
  },
  test: {
    url: process.env.TEST_DB_URL,
    dialect: 'mysql',
    logging: false,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'mysql',
  },
};

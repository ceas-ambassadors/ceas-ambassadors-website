// Configure any dotenv defined variables
require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Load models directory (which loads ./models/index)
const models = require('./models');

const indexRouter = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res/* , next */) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/**
 * Database configuration
 * The actual connecting to the database happend in `./models/index.js`,
 * this file just syncs the models and verifies the connection is valid
 */
// Sync models - very important step
models.sequelize.sync();
// Check connection
models.sequelize.authenticate().then(() => {
  console.log('Connection to database established.');
}).catch((err) => {
  console.error('Unable to connect to the database:', err);
  // Kill the process because there's no connection to the database
  process.exit();
});

module.exports = app;

This document is intended to be home to developer documentation for this project. It will contain details encompassing things like version control, style guides, and getting started on working with the project.

## Getting Started
### Things to Install
You'll need [git](git-scm.org), [Nodejs](https://nodejs.org/en/), and NPM, which is installed with Nodejs. If you're working with the databse, or need to run a database locally, you'll need to install [mysql](https://www.mysql.com/).
### Working with the code
To get started, first clone the repository using [git](#Version-Control).

`$git clone https://github.com/kurtlewis/ceas-ambassadors-website.git`

Then, install npm modules as specified in our `package.json`, using `npm install`. This will install the code that our website relies upon as well as some developer tools. To run the website locally, you'll need to configure environment variables. These are configuration options and secrets that SHOULD NOT be committed to version control. Copy `.env.example` to a new file called `.env`, and replace the placeholder values with relevant values. See [.env documentation for more instructions](#.env). If you need to start up a databse, this is the time to do so. If you don't, you'll need the url of a test database to connect to. Using mysql for the first time? See [database.md](database.md) for instructions on getting started.

To run the website, type `npm start`. Visit the website at localhost:3000. You're in business!

### Working with "Super User" features
Privileged actions are limited to users who are "super users", or admins/exec/office workers. A super user has the ability to create/edit/delete events, sign users up for events, and many other actions. Super users can grant other users super user power, or take it away. The first super user must be elevated manually, via a mysql UPDATE command. To work with super user features, you must elevate a user in your database.
1. Create an account that will be your super user account by using the sign up UI.
2. Login to mysql
3. Update the record for the created member to make them a super user.
These commands should do it:
```shell
# connect to the database - for instance (though this varies greatly by platform)
$ mysql -u root -p
# connect to the specific database you'd like to modify
mysql> use <insert-database-name>;
# elevate specific member
mysql> UPDATE Members SET super_user=1 WHERE email='<insert-email-of-account>';
# Verify results
mysql> SELECT * FROM Members WHERE email='<insert-email-of-account';
```

## Frontend / Writing webpages
We use a template rendering engine for creating webpages called [pug](https://pugjs.org/api/getting-started.html). If you need to write frontend webpages - the first thing you should do is skim through the language reference at that link for an initial understanding of what pug is and how to use it. In a nutshell, pug is a rendering engine that allows us to write shorthand html/css (or full html if you so choose), which is then transformed into html upon request. This lets us do some cool things like [insert arbitrary amounts of data into structured html](https://pugjs.org/language/iteration.html). 

All of the pug files are located in the `views` folder. All files that extend `layout.pug` will inherit it's base definitions - things like the ability to flash message, the nav bar, and a stylized container for content. Because of the multiple files that can define arguments for webpages, it can be difficult to keep track of possible (or necessary) arguments need to be passed to the render function. In the worst case, you can check every `extends` and `includes` directive in the files, but I hope to document in each file what arguments it takes.

CSS styles can be found in `public/stylesheets` directory. I intend to use only one css file unless it gets too long and unwieldy - I hope to keep it organized by grouping styles logically and commenting their purpose. 

Similar to CSS, javascript and image files are also held in the `public` directory. These files are where you would write frontend javascript (if we need it), which can then be included on pug files with the [`script` directive](https://pugjs.org/language/includes.html).

## Working on the backend
### Structure
The backend is structured in a model view controller (MVC) architecture. All three parts are in folders of the appropriate name. Models define attributes, methods, and sequelize configurations - you can find more information on sequelize in [database.md](database.md). Views are defined using pug, as written above in the frontend section. Controllers are where the bulk of the backend code can be found, and what most of this section will be devoted to.

It's important to understand what Express.js does - it is a middlware/router framework. Middlware refers to the different code that runs when you hit an endpoint (for instance, `/login`). Each of the defined middleware functions run, ending in your function, followed by error handlers and etc. Routes are defined in the `routes` directory. Here, specific routes are mapped to controller functions - there are controller functions for each type of http request a route expects. For instance, a handler for a get request to a page, that queries the database and sends the data to the renderer, or a handler for post requests to an endpoint, that verifies inputs and creates a new item in the databse before directing the user to a new page.

So, we have handlers setup for the appropriate functionality defined in the `controllers` directory.  A controller has a handful of parts that make it acceptable. If it's a POST request, it verifies it's inputs using [express-validator](). The controller should use promises (look up javascript promises if you don't know what that is) whenever possible, and only use callbacks when absolutely necessary. It'll help with code formatting in the log run! Once it becomes necessary to do something, the program should **return** that function, to ensure that execution of the controller stops. 

All handlers, because of custom middleware, have access to special variables defined in `res.locals`. These functions are defined in custom middleware in `app.js`. When rendering a page, you should almost always reference some of these objects, because this is how information like status and alerts are passed between controllers. Some objects, such as res.locals.alert and res.user are automatically sent to the rendering engine. 

#### Error handling
[Error handling in express is great.](https://expressjs.com/en/guide/error-handling.html) Our error handler can be found in `app.js`. When there is an error in synchronous code, this is called automatically. When there is an error in asynchronous code, `next(err)` must be called automatically. If in a callback, you'll need to call `return next(err)`. With promises, you can just write `.catch(next)` after your `then`. See the express docs linked above for more details.

When an error is encountered, it is logged, and then if in production, a generic message is shown to the user. If in development, the error is rendered for the benefit of the developer.
### res.locals/req.session defined in our custom middleware
There is a difference between `res.locals` and `req.sesson`! You can think of `res.locals` as variables for **this** specific request - that is, on `render`, `redirect`, or `send`, they will be gone! Use it to set alert messages or status immediately before rendering. `res.locals` preload variables from the sent `req.session` - if the previous request sent alert messages or a status code, they will be in the `res.locals` when handler execution begins. As you might guess, `req.session` variables are sent to the next request - primarily for use when it is necessary to `redirect`. **Alerts cannot be sent across redirects without using `req.session`!** Use `req.session` to send success codes, alert messages, and etc when you will be redirecting before rendering a page.
#### res.locals.status / req.session.status
For passing status between controllers - for instance if an object is created and you want to render a new page, but still want to return a 201 status, this is how that should be passed.
#### res.locals.alert / req.session.alert
`alert.errorMessages`, `alert.infoMessages`, `info.successMessages` - for rendering flash messages. You should `.push(<message>)` to these arrays, in case there are already existing messages in the arrays. It is not necessary to send res.locals.alert to a render function, as our custom middleware handles sending it to the renderer automatically!
#### res.user
`res.user` is the currently signed in member.

### Why does every `res.redirect()` call do a `req.session.save()`?
This is because of a problem with [express-session](https://github.com/expressjs/session/issues/74) where sessions cannot be saved as a blocking event for the server response. Here's a relevant issue on the [connect-session-sequelize module](https://github.com/mweibel/connect-session-sequelize/issues/20). So, we have to manually ensure that all sessions are saved before sent back to the user. I hope to eventually override the `res.redirect` call to enable saving the session automatically before actually redirecting. One option for this is [express-interceptor](https://www.npmjs.com/package/express-interceptor).

### Common variables that can be passed to view renderer
These variables can be used on every render command that uses the view `views/layout.pug`. In almost all cases, you can just use `res.locals.alert`, as defined above.
```
{
    'title': 'Title for tab goes here',
    'alert': {
        /* Optional - alert the user to an event's outcome. The alert object is optional, and so are each of it's arrays. All three can be included or only one. Only one message is required in the array, an unlimited number can be sent */
        'successMessages': ['Success Message 1', 'Success Message 2'],
        'infoMessages': ['Info Message 1', 'Info Message 2'],
        'errorMessages': ['Error Message 1, 'Error Message 2'],
    },
}
```
### npm Modules to know about
#### csurf
[csurf](https://github.com/expressjs/csurf) provides protection from cross site request forgery. Basically maliciously using 
existing session cookies to hit endpoints of another website. While we likely wouldn't come under attack like that - we don't
want to even leave the option. As part of this, a hidden input needs included on every form with the name `_csrf` - the value token for this
input is automatically available at `csrfToken` in views.

#### multer
[multer](https://github.com/expressjs/multer) is a module which handles the uploading of files. We use it for uploading profile pictures. See the production.md file for notes on how file storage works in production. Files need stored in the `/public` directory tree so that they are available to send to the client.

#### express-session
[Express-session](https://github.com/expressjs/session) Is how we mange sessions. They're stored in a special table in the database. This note is because we could eventually run into problems in prod (because of https and secure cookie settings), which could require enabling express trust proxy. See the [notes on cookie.secure here.](https://github.com/expressjs/session#cookiesecure)

## .env
This will be home to details on the different .env values. .env refers to the `.env` file used for development. Because we use docker to deploy the website and we use git to track version control, it's insecure to store production credentials in the git repo. We manage these on the server through the use of environment variables. But, on a development machine, you don't want to be changing environment variables all the time. So, we use the `dotenv` package for NPM to emulate environment variables - they're loaded from the file `.env` and treated as if they were environment variables. As mentioned elsewhere, copy `.env.example` and rename it `.env` to get started.
### Database URLs
All of the database URLs take the following format: `mysql://<user>:<password>@<host>/<db_name>`. You'll need to set the appropriate URLs for what you're doing. This likely means setting the dev and or test URLs. The production URL shouldn't be needed outside of the production server.
#### DEV_DB_URL
The development database URL - this database holds data with some consistency, in that there is probably test values in it usually.
#### TEST_DB_URL
This database is wiped entirely clean at the start and end of every test - so don't use the same URL as your DEV_DB_URL unless you want that.
#### DATABASE_URL
This should hold production data. It uses this environment variable because it's what is used by the dokku plugin.
### COOKIE_SECRET
This is the secret used to secure session cookies. This should be a randomly generated password in production, but it can be anything in PROD.
### RESET_KEY
This is the key that allows for reseting the website at the end of the semester. It should be a protected secret password, probably only known by the tech chair and president. A super user with this key will be able to delete all events and attendance records for all users.

## Tests
There will be a comprehensive test suite for this codebase. To run tests, first configure the website using the above instructions - tests won't work until you've gotten the website to run yourself. Then, just run `npm test`. Our tests are written using [mocha](https://mochajs.org/) as the runner, and [supertest](https://github.com/visionmedia/supertest) as a method of mocking a user on the website. In combination, they allow us to test the endpoints as if a user was using them. Ideally, all behavior on the website will have a test. This way, if we break that behavior with a code change or upgrading npm modules breaks behavior, it will be easy to determine.

### Writing Tests
To write tests, start by looking at existing tests - they are probably the easiest way to figure out how. Tests in Mocha are dividing into suites and test cases, and each test case should test one specific behavior. Use methods defined in `common.js` to avoid duplicating setup code, such as database clearing or session/event creation.

## Style Guide
We'll follow the [Airbnb style guide](https://github.com/airbnb/javascript). I chose this because it was the most popular javascript style guide at the time of writing. It is enforced by a linter run on the Travis CI build. You can run it locally by running `npm run lint` after running `npm install`.

## Build Tool
This project automatically triggers a run of tests and the linter on every push to Github. This is configured through our `.travis.yml` file. The build history can be accessed [here](https://travis-ci.org/kurtlewis/ceas-ambassadors-website).


## Version Control
This project's version control is managed using git. If you're unfamiliar with git, check out try.github.io. The main branch is the master branch. For the most part, this will use a feature-branch workflow, meaning that major features should be worked on in branches, then merged into master when complete. This is useful for making quick fixes without being impacted by in progress work. The intent is that major releases will be tagged using [semantic versioning](https://semver.org/). More information on the release process can be found below.

## Releases
Releases of this project should follow [semantic versioning](https://semver.org/). That means that changes that would make versions incompatible need to be marked as such. For instance, if a change fundamentally changes a structure of the database, we probably need to update the major version, so that we know to update the database if attempting to use an old database. There is no shame in having large version numbers - it's an informational number. Not every change needs to be a release either, it's okay to bundle releases, and probably preferable to minimize headache, especially with database changes.

When making a version change, tag the commit that marks a version on GitHub, and update 'package.json' wit the new version number. When making a hotfix - i.e. a version would have a problem without a specific commit or fix, make sure to tag and update the PATCH digit (the third number).
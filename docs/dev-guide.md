This document is intended to be home to developer documentation for this project. It will contain details encompassing things like version control, style guides, and getting started on working with the project.

## Getting Started
### Things to Install
You'll need [git](git-scm.org), [Nodejs](https://nodejs.org/en/), and NPM, which is installed with Nodejs. If you're working with the databse, or need to run a database locally, you'll need to install [mysql](https://www.mysql.com/).
### Working with the code
To get started, first clone the repository using [git](#Version-Control).

`$git clone https://github.com/kurtlewis/ceas-ambassadors-website.git`

Then, install npm modules as specified in our `package.json`, using `npm install`. This will install the code that our website relies upon as well as some developer tools. To run the website locally, you'll need to configure environment variables. These are configuration options and secrets that SHOULD NOT be committed to version control. Copy `.env.example` to a new file called `.env`, and replace the placeholder values with relevant values. See [.env documentation for more instructions](#.env). If you need to start up a databse, this is the time to do so. If you don't, you'll need the url of a test database to connect to.

To run the website, type `npm start`. Visit the website at localhost:3000. You're in business!

## Frontend / Writing webpages
We use a template rendering engine for creating webpages called [pug](https://pugjs.org/api/getting-started.html). If you need to write frontend webpages - the first thing you should do is skim through the language reference at that link for an initial understanding of what pug is and how to use it. In a nutshell, pug is a rendering engine that allows us to write shorthand html/css (or full html if you so choose), which is then transformed into html upon request. This lets us do some cool things like [insert arbitrary amounts of data into structured html](https://pugjs.org/language/iteration.html). 

All of the pug files are located in the `views` folder. All files that extend `layout.pug` will inherit it's base definitions - things like the ability to flash message, the nav bar, and a stylized container for content. Because of the multiple files that can define arguments for webpages, it can be difficult to keep track of possible (or necessary) arguments need to be passed to the render function. In the worst case, you can check every `extends` and `includes` directive in the files, but I hope to document in each file what arguments it takes.

CSS styles can be found in `public/stylesheets` directory. I intend to use only one css file unless it gets too long and unwieldy - I hope to keep it organized by grouping styles logically and commenting their purpose. 

Similar to CSS, javascript and image files are also held in the `public` directory. These files are where you would write frontend javascript (if we need it), which can then be included on pug files with the [`script` directive](https://pugjs.org/language/includes.html).

### Common variables that can be passed to view renderer
These variables can be used on every render command that uses the view `views/layout.pug`.
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

## .env
This will be home to details on the different .env values. .env refers to the `.env` file used for development. Because we use docker to deploy the website and we use git to track version control, it's insecure to store production credentials in the git repo. We manage these on the server through the use of environment variables. But, on a development machine, you don't want to be changing environment variables all the time. So, we use the `dotenv` package for NPM to emulate environment variables - they're loaded from the file `.env` and treated as if they were environment variables. As mentioned elsewhere, copy `.env.example` and rename it `.env` to get started.
### Database URLs
All of the database URLs take the following format: `mysql://<user>:<password>@<host>/<db_name>`. You'll need to set the appropriate URLs for what you're doing. This likely means setting the dev and or test URLs. The production URL shouldn't be needed outside of the production server.
#### DEV_DB_URL
The development database URL - this database holds data with some consistency, in that there is probably test values in it usually.
#### TEST_DB_URL
This database is wiped entirely clean at the start and end of every test - so don't use the same URL as your DEV_DB_URL unless you want that.
#### PROD_DB_URL
This should hold production data.

## Tests
There will be a comprehensive test suite for this codebase. To run tests, first configure the website using the above instructions - tests won't work until you've gotten the website to run yourself. Then, just run `npm test`.

## Style Guide
We'll follow the [Airbnb style guide](https://github.com/airbnb/javascript). I chose this because it was the most popular javascript style guide at the time of writing. It is enforced by a linter run on the Travis CI build. You can run it locally by running `npm run lint` after running `npm install`.

## Build Tool
This project automatically triggers a run of tests and the linter on every push to Github. This is configured through our `.travis.yml` file. The build history can be accessed [here](https://travis-ci.org/kurtlewis/ceas-ambassadors-website).


## Version Control
This project's version control is managed using git. If you're unfamiliar with git, check out try.github.io. The main branch is the master branch. For the most part, this will use a feature-branch workflow, meaning that major features should be worked on in branches, then merged into master when complete. This is useful for making quick fixes without being impacted by in progress work. The intent is that major releases will be tagged using [semantic versioning](https://semver.org/). More information on the release process can be found below.

## Releases
Releases of this project should follow [semantic versioning](https://semver.org/). That means that changes that would make versions incompatible need to be marked as such. For instance, if a change fundamentally changes a structure of the database, we probably need to update the major version, so that we know to update the database if attempting to use an old database. There is no shame in having large version numbers - it's an informational number. Not every change needs to be a release either, it's okay to bundle releases, and probably preferable to minimize headache, especially with database changes.

When making a version change, tag the commit that marks a version on GitHub, and update 'package.json' wit the new version number. When making a hotfix - i.e. a version would have a problem without a specific commit or fix, make sure to tag and update the PATCH digit (the third number).
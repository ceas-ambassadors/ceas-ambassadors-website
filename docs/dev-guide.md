This document is intended to be home to developer documentation for this project. It will contain details encompassing things like version control, style guides, and getting started on working with the project.

## Getting Started
### Things to Install
You'll need [git](git-scm.org), [Nodejs](https://nodejs.org/en/), and NPM, which is installed with Nodejs. If you're working with the databse, or need to run a database locally, you'll need to install [mysql](https://www.mysql.com/0).
### Working with the code
To get started, first clone the repository using [git](#Version-Control).

`$git clone https://github.com/kurtlewis/ceas-ambassadors-website.git`

Then, install npm modules as specified in our `package.json`, using `npm install`. This will install the code that our website relies upon as well as some developer tools. To run the website locally, you'll need to configure environment variables. These are configuration options and secrets that SHOULD NOT be committed to version control. Copy `.env.example` to a new file called `.env`, and replace the placeholder values with relevant values. See [.env documentation for more instructions](#.env). If you need to start up a databse, this is the time to do so. If you don't, you'll need the url of a test database to connect to.

To run the website, type `npm start`. Visit the website at localhost:3000. You're in business!

## .env
This will be home to details on the different .env values.

## Tests
There will be a comprehensive test suite for this codebase. To run tests, first configure the website using the above instructions - tests won't work until you've gotten the website to run yourself. Then, just run `npm test`.

## Style Guide
We'll follow the [Airbnb stle guide](https://github.com/airbnb/javascript). I chose this because it was the most popular javascript style guide at the time of writing. It is enforced by a linter run on the Travis CI build. You can run it locally by running `npm run lint` after running `npm install`.

## Build Tool
This project automatically triggers a run of tests and the linter on every push to Github. This is configured through our `.travis.yml` file. The build history can be accessed [here](https://travis-ci.org/kurtlewis/ceas-ambassadors-website).


## Version Control
This project's version control is managed using git. If you're unfamiliar with git, check out try.github.io. The main branch is the master branch. For the most part, this will use a feature-branch workflow, meaning that major features should be worked on in branches, then merged into master when complete. This is useful for making quick fixes without being impacted by in progress work. The intent is that major releases will be tagged using [semantic versioning](https://semver.org/). More information on the release process can be found below.

## Releases
Releases of this project should follow [semantic versioning](https://semver.org/). That means that changes that would make versions incompatible need to be marked as such. For instance, if a change fundamentally changes a structure of the database, we probably need to update the major version, so that we know to update the database if attempting to use an old database. There is no shame in having large version numbers - it's an informational number. Not every change needs to be a release either, it's okay to bundle releases, and probably preferable to minimize headache, especially with database changes.

When making a version change, tag the commit that marks a version on GitHub, and update 'package.json' wit the new version number. When making a hotfix - i.e. a version would have a problem without a specific commit or fix, make sure to tag and update the PATCH digit (the third number).
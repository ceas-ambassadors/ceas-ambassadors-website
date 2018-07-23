This document is home to the technical design of the website. Will outline
features, database, and architecture. At a certain point in the implementation 
of this project, this document might become outdated. I'll try to at least
add a note that this has happened if I don't intend to update the design doc.

# Architecture
Will build a backend using NodeJS, and  [ExpressJS](https://expressjs.com).
It will have a MVC architecture. Will use Pug for the
template renderer, and mysql for the database. While MySql isn't well developed for NodeJS like
something MongoDB is, our database really only makes sense to be done as a relational database.
I'm going to use Sequelize for the the MySql ORM. [Link to database document here](database.md).

# Outstanding Questions
#### Need to define database schema better

# Models
These models define the different data attributes that entities should have - they do not describe the actual structure of the database. See the database document for those details
## Member
This is now the user/member - because we're moving to a login only system.
* Name
* email address
* major
* graduation year
* MNumber
* hours completed
* meetings attended
* Not needed - for when a member shows up but is not needed at an event
* Picture
* Clubs involved in
* Research
* ACCEND, Minors
* hometown
* coop experience
* password
* is super user
* is private user - will not appear on member listing (for use by office staff)
### On super users
Super users have the ability to add events, confirm members for events, etc. Need a way to only mark specific people as super users
## Event
Should events be seperate from meetings? I think probably. But meeting could just
be a flag on the event.
* Title
* Start time
* End time
* Description
* Location
* Summary
* Signed up members
* confirmed attended members
* public/private - does it appear in list view?
## Meetings?
Not that different from events... revist this.
Only logged in users can let people sign into meetings.

# Requirements
I've organized requirements here by feature group. I've marked the front of reqs
with a `[I]` for incomplete, a `[C]` for complete, and a `[N]`for no intention to complete. I intend to only mark a requirement complete once it and it's test case(s)
have been written.

## General Website
### [C] Testing framework
Need a way to make writing tests easy - probably `mocha` and `chai`.
### [C] Alert system
Need an easy way to notify users that something has happened - using a notification system like the one on the old website works well. It would be an argument that could be passed to any render, because the base render page would render messages (including error, success, and info). Sometimes this is referred to as a flash
### [C] Footer
Written by, copyright, github link, license.
### [I] Header
Links to all pages
### [I] Virtual Tour
Virtual tour is just an iframe. Just need a page for it.
### [I] Production mode
The express generator does some stuff to denote when a website is running in production mode. Need to make sure this is set up correctly, probably a test mode as well.
### [C] Environment variable management
Need to use `dotenv` to manage environment variables/secrets
### [I] Reset website
The current website has functionality to reset the website for a new semester.
This clears out current hours, events, and meetings.
### [I] Apply page
There should be a page that has a link to apply for ambassadors. I can just iframe
a google doc here. 
### [I] Favicon
Will need an icon for the site
### [C] Home page
Need a home page that lists upcoming events, meetings, and maybe a randomly chosen
featured member?
### [I] FAQ
A place for us to add frequently asked tour questions, and their answers. Can be useful if there are
prospective students looking at the site, or for training material for ambassadors.
### [I] Contact form
A form where you can provide name, email, and notes - could be used by potential ambassadors,
potential students, or for submitting website feedback. Would need to feed into our email
to be checked.

## Members
### [I] Delete members
Members need to be deletable, for leaving the org or graduating. Should only be an allowable action for super users. Should ask for confirmation before deleting.
### [I] Detail view of member
Should show all details on member, including attended events and meetings, contact info, total hours, etc. Super users should be able to view this for any given member, and a member should be able to view their own.
### [I] Add custom event
Members complete custom events, need to be able to add a single event.
This should create a real event, and then mark it as private. Only super users should have this ability.
### [I] List view of members
Currently, this has a "highlight by service hour requirement" for logged in users. This would be a good idea. Requires frontend javascript code. Only logged in super users should see how many hours a member has.

## Events
### [C] Add new events
Should verify that the event is valid - that is, it should not let the end time
be before the start time. Super user only
### [I] Delete events
Hours should be linked - so deleting an event should cause a member's hours to decrease. Super user only
### [I] Edit events
Hours should be linked - editing an event should cause a member's hours to change. Super user only.
### [C] Detail view
Should include signed up members, and confirmed attended members. Confirmed members should be super user only.
### [C] List View
All members should be able to see all public tours
### [C] Sign up for tours
Members need to be able to sign up for events. Should send a flash message confirming
sign up.
### [C] Confirm attendance
Super Users need the ability to confirm that a member attended the event
### [C] Deny attendance
Need the ability to deny attendance - for when a member signed up and that did not
attend. Super user only
### [C] Not needed attendance
Need the ability to denote that a member showed up, but was not needed. Super user only
### [I] ?Repeating events
Repeating events would be super cool - but also very hard to implement
### [I] ?Sign up reminders
It would be cool if the event sent a reminder at midnight the day of a tour to 
remind everyone who is signed up, that they are signed up. Could get annoying - 
would need a way to disable or mark they would prefer not to receive such an email. 

## Accounts - part of members, but these are for the specific account related action
### [I] Send invite
Super users should be able to insert a UC email to send an invite to a member. That email will contain
instructions for creating their account. Via this email should be the only way a member can be created. 
### [I] Reset password
Need to loop into an email service to send password reset tokens
### [C] sign in
### [C] sign out
### [C] change password

# Maintenance
Its imperative that the website is easy to maintain. That means there need to be
test(s) for every requirement. There needs to be github integrations to track
updates to node modules. There needs to be backup functionality. I'll need to write a manual
testing document for elements that can't be automatically tested.

This document is home to the technical design of the website. Will outline
features, database, and architecture. At a certain point in the implementation 
of this project, this document might become outdated. I'll try to at least
add a note that this has happened if I don't intend to update the design doc.

# Architecture
Would build a backend using NodeJS, and probably [ExpressJS](https://expressjs.com).
Therefore, it would probably have a MVC architecture. Will likely use Pug for the
template renderer, and mysql for the database. Mysql is up for debate - its not well
developed in NodeJS but our website does not make sense for a non-relational database.

# Outstanding Questions
#### Need to define database schema better

# Models
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
### [I] Testing framework
Need a way to make writing tests easy - probably `mocha` and `chai`.
### [I] Alert system
Need an easy way to notify users that something has happened - using a notification system like the one on the old website works well. It would be an argument that could be passed to any render, because the base render page would render messages (including error, success, and info).
### [I] Footer
Written by, copyright, github link, etc
### [I] Header
Links to all pages
### [I] Virtual Tour
Virtual tour is just an iframe. Just need a page for it.
### [I] Production mode
The express generator does some stuff to denote when a website is running in production mode. Need to make sure this is set up correctly
### [I] Environment variable management
Need to use `dotenv` to manage environment variables/secrets
### [I] Reset website
The current website has functionality to reset the website for a new semester.
This clears out current hours, events, and meetings.
### [I] Apply page
There should be a page that has a link to apply for ambassadors. I can just iframe
a google doc here. 
### [I] Favicon
Will need an icon for the site
### [I] Home page
Need a home page that lists upcoming events, meetings, and maybe a randomly chosen
featured member?
### [I] FAQ
A place for us to add frequently asked tour questions, and their answers. Can be useful if there are
prospective students looking at the site, or for training material for ambassadors.
### [I] Contact form
A form wehre you can provide name, email, and notes - could be used by potential ambassadors,
potential students, or for submitting website feedback. Would need to feed into our email
to be checked.

## Members
### [I] Delete members
Members need to be deletable, for leaving the org or graduating
### [I] Detail view of member
Should show all details on member, including attended events and meetings, contact info, total hours, etc. Super users should be able to view this for any given member, and a member should be able to view their own.
### [I] Add custom event
Members complete custom events, need to be able to add a single event. I think
this should create a real event, and then mark it as private. Only super users should have this ability.
### [I] List view of members
Currently, this has a "highlight by service hour requirement" for logged in users. This would be a good idea. Requires frontend javascript code. Only logged in super users should see how many hours a member has.

## Events
### [I] Add new events
Should verify that the event is valid - that is, it should not let the end time
be before the start time. Super user only
### [I] Delete events
Hours should be linked - so deleting an event should cause a member's hours to decrease. Super user only
### [I] Edit events
Hours should be linked - editing an event should cause a member's hours to change. Super user only.
### [I] Detail view
Should include signed up members, and confirmed attended members
### [I] List View
### [I] Sign up
Members need to be able to sign up for events. Should send a message confirming
sign up.
### [I] Confirm attendance
Super Users need the ability to confirm that a member attended the event
### [I] Deny attendance
Need the ability to deny attendance - for when a member signed up and that did not
attend
### [I] Not needed attendance
Need the ability to denote that a member showed up, but was not needed.
### [I] ?Repeating events
Repeating events would be super cool - but also very hard to implement
### [I] ?Sign up reminders
It would be cool if the event sent a reminder at midnight the day of a tour to 
remind everyone who is signed up, that they are signed up. Could get annoying - 
would need a way to disable or mark they would prefer not to receive such an email. 

## Accounts
### [I] Delete accounts
Not everyone needs to keep an account forever - does this require a super user,
or should this be a database action?
### [I] Reset password
Need to loop into an email service to send password reset tokens
### [I] sign in
### [I] sign out
### [I] change password

# Maintenance
Its imperative that the website is easy to maintain. That means there need to be
test(s) for every requirement. There needs to be github integrations to track
updates to node modules. There needs to be backup functionality. 
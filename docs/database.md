This document is home to the actual design for our database, instructions for working with Sequelize, our ORM, and commonly used database queries.

# Database Design
This is the actual structue of the tables and their relationships. 
### Member
* id
* creation_date
* email - primary key
* first_name
* last_name
* major
* grad_year
* minutes **summation**
* meetings **summation**
* minutes_sent_home **summation**
* path_to_picture
* clubs
* minors
* accend
* hometown
* coops
* password
* super_user
* private_user

### Event
* id - primary key
* creation_date
* title
* start_time
* end_time
* description
* location
* summary
* public

### Attenddee - Join table of Member and Event
* id - primary key
* creation_date
* email - foreign key to member
* event_id -  foreing key to event
* status - unconfirmed, confirmed, not-needed

## On summation columns
There are a few ways I can approach summation columns (minutes, meetings, etc) on member. There needs to be a way to stop those values from becoming stale - if an event is updated, when a member is confirmed for attending, etc.
1. I can setup a [SQL trigger](https://dev.mysql.com/doc/refman/8.0/en/triggers.html) on event update, insert, delete to recalculate those numbers. 
2. Using the above, I can set a [trigger in sequelize](https://dev.mysql.com/doc/refman/8.0/en/triggers.html). This could be implemented through a [sequelize hook](http://docs.sequelizejs.com/manual/tutorial/hooks.html).
3. I could not store these fields. I could just manually calculate them everytime they are requested. This would be slow though.
4. I could cache calculated values and recalculate them at regular intervals - every hour, etc. 
I currently favor option 2 - but I'll need to play around with them some. I'll update this document to indicate the choice I made once I've made it.

# Working with Sequelize
This project will utilize [Sequelize](sequeilzejs.com) for our database ORM. I'll make notes here on using it, including it's auto generated migrations and etc.

# Common Database Queries
This is where I'll document the database queries that need to be run on a semi-regular basis for maintainence purposes.
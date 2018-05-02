This document is home to the actual design for our database, instructions for working with Sequelize, our ORM, and commonly used database queries.

## Naming Standards
Models names should be nouns - `Member`, `Event`, `Attendance`, etc. Sequelize automatically pluralizes them for table names, so `Member` becomes `Members`. Sequelize has no regard for grammatic conventions, it just appends an `s`. Column names (and attributes) should be named with underscores, so `myAttribute` becomes `my_attribute`.

# Database Design
This is the actual structue of the tables and their relationships. 
### Member
* creation_date
* email - primary key
* first_name
* last_name
* major
* grad_year
* minutes **summation**
* meetings **summation**
* minutes_not_needed **summation**
* path_to_picture
* clubs
* minors
* accend
* hometown
* coops
* password
* super_user
* private_user
* created_at
* updated_at

### Event
* id - primary key
* title
* start_time
* end_time
* description
* location
* summary
* public
* created_at
* updated_at


### Attendance - Join table of Member and Event
* member_email - foreign key to member
* event_id -  foreign key to event
* status - unconfirmed, confirmed, not-needed
* created_at
* updated_at

## On summation columns
There are a few ways I can approach summation columns (minutes, meetings, etc) on member. There needs to be a way to stop those values from becoming stale - if an event is updated, when a member is confirmed for attending, etc.
1. I can setup a [SQL trigger](https://dev.mysql.com/doc/refman/8.0/en/triggers.html) on event update, insert, delete to recalculate those numbers. 
2. Using the above, I can set a [trigger in sequelize](https://dev.mysql.com/doc/refman/8.0/en/triggers.html). This could be implemented through a [sequelize hook](http://docs.sequelizejs.com/manual/tutorial/hooks.html).
3. I could not store these fields. I could just manually calculate them everytime they are requested. This would be slow though.
4. I could cache calculated values and recalculate them at regular intervals - every hour, etc. 
I currently favor option 2 - but I'll need to play around with them some. I'll update this document to indicate the choice I made once I've made it.

# Working with Sequelize
This project will utilize [Sequelize](sequelizejs.com) for our database ORM. I'll make notes here on using it, including it's auto generated migrations and etc. Sequelize does a lot of magic behind the scenes, which is bad for building an understanding of what's going on, so right here I'm going to write up a quick explanation of the basics of Sequelize.

Sequelize takes the model definitions found in the `models` folder (with the exception of `models/index.js`) and turns them into SQL tables. It appends a handful of attributes - `updated_at`, `created_at` and if no primary key is defined, `id`. Sequelize allows you to set associations between tables, in our case this is the relationship between a member and events (a member attends events, bails on events, etc). The relationship currently used in this project is a [m:n belongs-to-many association](http://docs.sequelizejs.com/manual/tutorial/associations.html#belongs-to-many-associations). This type of join requires a `join-table`, basically a table that's sole purpose is to define the relationship. This is our `Attendance` table. It holds the keys of the two entities, a member and event, and the status of that relationship, in our case - was it a meeting, and have they been confirmed yet?. Because Sequelize handles the creation of this relationship behind the scenes, it can be confusing. The table itself is defined in the `models/attendance.js` file, but the Member and Event entities are associated in their associations portion of their files in the `models` folder. This automatically adds a `member_email` and `event_id` column to the `Attendance` table (I customized the inputted names).

The actual point in time where Sequelize executes its code is when the `models` folder is imported by  `require(../models)`. This executes the code in `models/index.js`. Upon the start of the app in `app.js`, the models are synced useing `sequelize.sync()`, which syncs all defined models to the database. SEQUELIZE WILL NOT NOTICE IF THE DATABASE DOESN'T MATCH THE DEFINED MODELS UNTIL IT TRIES TO ADD SOMETHING. This is why the migrations mentioned in this document are so important.

# Migrations
Sequelize encourages the use of migrations - the files with weird names that can be found in the `migrations` folder. The purpose of these files is to allow you to use the `sequelize-cli` tool to automatically move between versions of the database. The hard part is, these need to be painstakingly updated to make sure they match the exact version of the real database. I need to come up with some automatic tests for these migrations, because they're very important. I'll update here once I've done so. 

# Common Database Queries
This is where I'll document the database queries that need to be run on a semi-regular basis for maintainence purposes.
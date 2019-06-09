This document is home to the actual design for our database, instructions for working with Sequelize, our ORM, and commonly used database queries.

## Getting Started
If you have mysql installed, you need to start by getting databases created for the website to connect to. For development, you'll need two - a dev and test database. The dev database is used when you run the website with `npm start`, the test database is used when you run `npm test`. They're different because testing routinely wipes the database of rows, meaning data you were using for development would be removed when you don't want it to be.

First, make sure that mysql is running and that you can connect with the root user you created during installation. `$ mysql -u root -p`. If it's running and you're connected, create two databases on the mysql prompt `mysql> create database amb_site_test;` and `mysql> create database amb_site_dev;`. Next, you'll want to create a user and give it full access on both of those databases - [see this guide for instructions](https://www.lanexa.net/2011/08/create-a-mysql-database-username-password-and-permissions-from-the-command-line/). Finally, set your .env variables for the connection details following the instructions in [dev-guide.md](dev-guide.md).

### Troubleshooting
On Windows, to connect the first time to a MySQL server, open MySQL Shell and first type `\sql` to allow for SQL scripting. To connect to the databases, `\connect <root>:<insert password>@localhost:3306`. To reveal databases type: `show databases;`, which can give you the names of your dev and test databases for your .env file. There is no database for the `DATABASE_URL` if you're running this locally.


## Naming Standards
Models names should be nouns - `Member`, `Event`, `Attendance`, etc. Sequelize automatically pluralizes them for table names, so `Member` becomes `Members`. Sequelize has no regard for grammatic conventions, it just appends an `s`. Column names (and attributes) should be named with underscores, so `myAttribute` becomes `my_attribute`.

# Database Design
This is the actual structue of the tables and their relationships. Each heading here is a model, and therefore table in our database - though as noted in [naming standards](#Naming Standards), they are pluralized.
### Member
* id
  * unique auto incrementing id for member - primary key
* email 
  * the user's email. Should have unique key
* first_name
* last_name
* major
* grad_year
* service **summation**
  * This field is a summation of the time of events a user has attended.
  * See below for notes on how we'll handle the summation columns
* meetings **summation**
  * This field is a summation of the number of meetings a user has attended.
  * See below for notes on how we'll handle the summation columns
* service_not_needed **summation**
  * This field is a summation of the time of events a user has been sent home from because they were unneeded.
  * See below for notes on how we'll handle the summation columns
* path_to_picture
  * hopefully we will implement bio pictures - this field is there to hold the path to their bio picture
* clubs
  * This is a text column containing a list of clubs the user has attended
* minors
  * This is a string field indicating if the user is in any minors
* accend
  * This is a boolean field indicating if the user is in ACCEND
* hometown
  * This is a string field for the user's hometown
* coops
  * This is a text field for listing a user's coops
* password
  * This is an encrypted string representing the user's password
* super_user
  * This boolean field indicates that a user has super user powers 
  * Super user powers include but are not limited to - creating events, confirming attendance, etc
* private_user
  * This is a user that shouldn't show up in the member listing. Office workers, shared accounts, etc
* created_at
  * Date record was created - automatically handled by sequelize
* updated_at
  * Date record was last updated - automatically handled by sequelize

### Event
* id - primary key
  * incrementally generated id key used to identify an event
* title
  * string representing the name of the event
* start_time
  * date representing the start time of the event
* end_time
  * date representing the end of the event
* description
  * text field describing the event
* location
  * string field describing the location of the event
* public
  * boolean field indicating if an event is public
  * for instance, a one on one or lunch would not be public, because only one ambassador attended it
* meeting
  * boolean field representing if an event is a meeting
* created_by
  * int - id of user who created event. foreign key to Member
* created_at
  * Date record was created - automatically handled by sequelize
* updated_at
  * date record was last updated - automatically handled by sequelize


### Attendance - Join table of Member and Event
* member_id - foreign key to member
* event_id -  foreign key to event
* status - unconfirmed, confirmed, not-needed, meeting
  * Enum field representing the status of the attendance
  * a no-show attendance can just delete the record
* created_at
  * Date record was created - automatically handled by sequelize
* updated_at
  * date record was last updated - automatically handled by sequelize

### Session - Used by our session module
Very rarely should this table need accessed - everything involving this table should be done via session manipulation, not database queries/writes.
It's worth noting that this does not follow some of the naming standards because
doing so would break the session module.
* sid - session id - primary key
* expires - date when session expire
* data - serialized data in session stored in database


## On summation columns
Summation columns are managed using [sequelize hooks](http://docs.sequelizejs.com/manual/tutorial/hooks.html). This means one must take care not to affect these columns when manually running sql update/delete commands on events and attendance records. I intend to eventually add an endpoint for resyncing the database. Hooks for bulk operations should result in hooks for individual events being called, [per this issue on the sequelize repo](https://github.com/sequelize/sequelize/issues/6368). 

**DO NOT UPDATE/DELETE EVENT OR ATTENDANCE RECORDS MANUALLY - THEY WILL DESYNC THE DATABASE**

## Referential Integrity
Referential integrity means that when a record is deleted/updated and a row in another table references that row, it is also affected. As mentioned elsewhere in this document, the summation columns are managed via application logic hooking into sequelize events. The attendance table is managed dualy via sql itself  and sequelize though. If an event is deleted via the app, sequelize will cascade the delete to the attendance table, so that the appropriate hooks are called. If a member is deleted, the action is handled automatically by sql and no hooks are run. Sequelize only hooks into hook events in the application to manage updating summation columns accordingly.

# Working with Sequelize
This project will utilize [Sequelize](sequelizejs.com) for our database ORM. I'll make notes here on using it, including it's auto generated migrations and etc. Sequelize does a lot of magic behind the scenes, which is bad for building an understanding of what's going on, so right here I'm going to write up a quick explanation of the basics of Sequelize.

Sequelize takes the model definitions found in the `models` folder (with the exception of `models/index.js`) and turns them into SQL tables. It appends a handful of attributes - `updated_at`, `created_at` and if no primary key is defined, `id`. Sequelize allows you to set associations between tables, in our case this is the relationship between a member and events (a member attends events, bails on events, etc). The relationship currently used in this project is a [m:n belongs-to-many association](http://docs.sequelizejs.com/manual/tutorial/associations.html#belongs-to-many-associations). This type of join requires a `join-table`, basically a table that's sole purpose is to define the relationship. This is our `Attendance` table. It holds the keys of the two entities, a member and event, and the status of that relationship, in our case - was it a meeting, and have they been confirmed yet?. Because Sequelize handles the creation of this relationship behind the scenes, it can be confusing. The table itself is defined in the `models/attendance.js` file, but the Member and Event entities are associated in their associations portion of their files in the `models` folder. This automatically adds a `member_id` and `event_id` column to the `Attendance` table (I customized the inputted names).

The actual point in time where Sequelize executes its code is when the `models` folder is imported by  `require(../models)`. This executes the code in `models/index.js`. Upon the start of the app in `app.js`, the models are synced useing `sequelize.sync()`, which syncs all defined models to the database. SEQUELIZE WILL NOT NOTICE IF THE DATABASE DOESN'T MATCH THE DEFINED MODELS UNTIL IT TRIES TO ADD SOMETHING. This is why the migrations mentioned in this document are so important.

# Migrations
There are two approaches to this, one is using the sequelize-cli to
automatically handle migrations. The other is doing them ourselves through
`ALTER TABLE...` commands. I consider there to be pro's and cons to both.

# Approach One
Originally, I had intended to utilize the `sequelize-cli` for database
migrations. [Here are the docs for it.](http://docs.sequelizejs.com/manual/migrations.html).
There are some configuration problems with it that make it undesirable, namely
we don't have access to our database without connecting to the production
server, and that's a good thing. It also requires writing code to do the
migrations, which is harder than just writing the SQL to do it outright.
Migrations were autogenerated up until version 2, at which point they were
deleted.  They can be found in the git version control prior to v2.0.0.

# Approach Two - What We Actually Use
The node app will create a database if it does not exist, so initial database
creations do not need to exist.

But, we do need a way to get the database between the schemas of a specific
version and the schemas of the next version. To accomplish this, I'm just going
to create files that document the SQL commands that need run to alter the
schemas.

To actually migrate the databases, the steps are as follows:
1. Stop the node app running the old version of the site.
2. Make a backup of the database in case anything goes wrong.
3. Connect to the database and run the migration commands.
4. Update the node app to the new version.
5. Start the node app again.

# Common Database Queries
This is where I'll document the database queries that need to be run on a semi-regular basis for maintainence purposes.

This document is home to the actual design for our database, instructions for working with Sequelize, our ORM, and commonly used database queries.

## Getting Started
If you have mysql installed, you need to start by getting databases created for the website to connect to. For development, you'll need two - a dev and test database. The dev database is used when you run the website with `npm start`, the test database is used when you run `npm test`. They're different because testing routinely wipes the database of rows, meaning data you were using for development would be removed when you don't want it to be.

You're welcome to use whatever version of MySQL that you want, but the tech commitee team encourages you to download the [MySQL Workbench](https://dev.mysql.com/downloads/workbench/). Be it on MacOS or Windows, you're gonna need this to both see the data and make changes to your local database for development. When you open the workbech, you should see a localhost session already running. 
![MySQL Workbench](/public/images/MySQLWorkbench.png)

### Troubleshooting
If you downloaded the MySQL Workbech and you cannot connect to a localhost session, you likely did not download the MySQL Server along with your workbench. You'll need both - workbench is the UI/application you can interact with while the server is the connective piece that will load your data and schema. 

For Windows, you can download the server using the [MySQL installer](https://dev.mysql.com/downloads/windows/installer/). For MacOS, use [this link](https://dev.mysql.com/downloads/installer/). Select the smaller option (about 2.3 MB) and then open the UI. 
![MySQL Installer](/public/images/MySQLInstaller.png)

On the right-hand side of the window, you should see an "Add" button. Click on it, and then find the MySQL Server X.X.X by clicking onto the expand buttons. Once you've found the most recent MySQL Server release, click it and then click the green arrow in the middle of the two menus. You should see the version you want move to the right window. Click next, and continue to click "Next" or "Apply" until you're prompted to create a root password. Make sure this is something you remember. Continue with "Next" and "Apply" and "Execute" and finish.

To connect to your local session, click the "add" button. A window will open. Fill in a connection name, change the Hostname to "localhost", and test the connection. If successful, finish by hitting the "Apply" button.
![MySQL Setup Connection](/public/images/MySQLSetupConnection.png)

## Naming Standards
Models names should be nouns - `Member`, `Event`, `Attendance`, etc. Sequelize automatically pluralizes them for table names, so `Member` becomes `Members`. Sequelize has no regard for grammatic conventions, it just appends an `s`. Column names (and attributes) should be named with underscores, so `myAttribute` becomes `my_attribute`.

# Database Design
This is the actual structue of the tables and their relationships. Each heading here is a model, and therefore table in our database - though as noted in [naming standards](#Naming Standards), they are pluralized.

### Members
| Name               | Description                            | Type  | Summation |
| ------------------ | -------------------------------------- | ----- | --- |
|  id                | unique auto incrementing identifier for each member - primary key | int |    |
| email              | the user's UC email - should have unique key | string |    |
| first name         |                                        | string |    |
| last name          |                                        | string |    |
| major              |                                        | string |    |
| grad_year          |                                        | int    |    |
| service            | summation of the points from events a user has attended | int | :white_check_mark: |
| meetings           | summation of the number of meetings a user has attended | int | :white_check_mark: |
| service_not_needed | summation of the time of events a user has been marked "Not Needed" at an event | int | :white_check_mark: |
| path_to_picture    | holds the path to their bio picture    | text   |    |
| clubs              | list of clubs the user is a part of    | string |    |
| minors             | list of any minors the user may have   | string |    |
| accend             | indicates if user is in ACCEND program | boolean |   |
| hometown           |                                        | string |    |
| coops              | list of coops the user has done        | string |    |
| is_certified       | indicates if user is certified         | boolean |   |
| password           | encryption of user's selected password | string |    |
| super_user         | indicates if user has admin permissions - usually an office worker or exec member | boolean |    |
| private_user       | if true, user profile is hidden to all but super_users. doesn't show in member listing | boolean |    |
| created_at         | date user was signed up - automatically handled by sequelize | date |    |
| updated_at         | date profile was last edited - automatically handled by sequelize | date |    |

### Events
| Name               | Description                            | Type  | Summation |
| ------------------ | -------------------------------------- | ----- | --- |
| id                 | incrementally generated id key used to identify an event - primary key | int |    |
| title              | the name of the event                  | string |    |
| start_time         |                                        | date   |    |
| end_time           |                                        | date   |    |
| description        |                                        | string |    |
| location           |                                        | string |    |
| public             | indicates if event is open to the public | boolean |    |
| meeting            | indicates if event is a meeting        | boolean |   |
| is_disabled        | indicates if sign-ups are turned off   | boolean |   |
| created_by         | id of the user who made the event - foreign key to Member | int |    |
| created_at         | date of when event was created - automatically handled by sequelize | date |    |
| updated_at         | date event was last edited - automatically handled by sequelize | date |    |

### Attendance - join table of Member and Event
| Name               | Description                            | Type  | Summation |
| ------------------ | -------------------------------------- | ----- | --- |
| member_id          | foreign key to member                  | int   |    |
| event_id           | foreign key to event                   | int   |    |
| status             | represents the status of the attendance - a no-show attendance can just delete the record | enum('unconfirmed','confirmed','not_needed') |    |
| created_at         | date of when event was created - automatically handled by sequelize | date |    |
| updated_at         | date of when record was last updated - automatically handled by sequelize | date |    |

### Session - Used by our session module
Very rarely should this table need accessed - everything involving this table should be done via session manipulation, not database queries/writes.
It's worth noting that this does not follow some of the naming standards because
doing so would break the session module.

| Name               | Description                            | Type  | Summation |
| ------------------ | -------------------------------------- | ----- | --- |
| sid                | session id - primary key               | int   |     |
| expires            | date when session expires              | date  |     |
| data               | serialized data in session stored in database | text |     |

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
There are two approaches to this, one is using the sequelize-cli to automatically handle migrations. The other is doing them ourselves through `ALTER TABLE...` commands. I consider there to be pro's and cons to both. If you alter the tables, remember to update the docs to reflect said changes.

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

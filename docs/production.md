# Deployment
This file is based around the different things that you need to concern yourself with when deploying
the site. It includes maintenance information, information on building a server image, etc.

# Building a server
If the website has already been deployed for you - this can be ignored if a server already exists.
The choices here are my own - there are many ways in which the website can be run, this is how I (kurt)
chose to run it. You can choose something different if you prefer it - but I implore you to consider
documentation and ease of maintenance. 

## Get a server
Create a server on a server hosting platform of your choice. It should be a linux server, 
preferably with at least 1 GB of RAM. Our initial deployment is on Linode, with an Ubuntu 18.04 LTS
image. I created a user for the administrator following the steps listed later.
## Install dokku
Install dokku using the instructions found on [their github](https://github.com/dokku/dokku).
Sit back and relax, this takes a while. Once it finishes, you'll be presented with a web-ui. Make sure to enter your public key.
I setup dokku to use virtualhost naming, but it doesn't matter
a whole lot, you'll configure domains later. 
### Dokku plugins we will need
Dokku uses plugins to manage common operations - we can actually run everything we need to in dokku
containers!
#### Mysql
We will need a database for the website! We use the official dokku plugin: [dokku-mysql](https://github.com/dokku/dokku-mysql).
#### lets-encrypt
We use lets-encrypt to manage ssl certificates and https support, for free! [dokku-letsencrypt](https://github.com/dokku/dokku-letsencrypt)
### Setting up the app
Full deploy documentation can be found [here](http://dokku.viewdocs.io/dokku~v0.12.12/deployment/application-deployment/).
The steps I followed are:
```shell
$ dokku apps:create amb-site
$ dokku mysql:create amb-db
$ dokku config:set amb-site NODE_ENV='production'
$ dokku config:set amb-site COOKIE_SECRET='<randomly-generated-password-here>'
```
We need to setup a storage directory for the images - because the website runs in a container, if we don't do this,
all photos uploaded are deleted upon the container being restarted. By  connecting a real directory to a directory in the app,
images will be written to a real location on disk. Full documentation is [here](https://github.com/dokku/dokku/blob/master/docs/advanced-usage/persistent-storage.md). Dokku recommends setting this in the following directory `/var/lib/dokku/data/storage`, which is created on install. The full path for our directory is: `/var/lib/dokku/data/storage/amb-site/images/profile`.
```shell
# create the directory
$ sudo mkdir /var/lib/dokku/data/storage/amb-site
$ sudo mkdir /var/lib/dokku/data/storage/amb-site/images
$ sudo mkdir /var/lib/dokku/data/storage/amb-site/images/profile
$ sudo chown -R dokku:dokku /var/lib/dokku/data/storage/amb-site
$ dokku storage:mount amb-site /var/lib/dokku/data/storage/amb-site/images/profile:/app/public/images/profile
# per the docs, you need to restart
$ dokku ps:restart amb-site
```
On your personal computer, you'll need to setup a remote for sending code to
```shell
git remote add dokku-prod dokku@<ip>:amb-site
# You can only send the master branch
git push dokku-prod master 
```
If this is the first deployment of the site, you need to make a user a super user, so go to the website
and create an account. Then, on the server, run the following commands.
```shell
$ dokku mysql:connect amb-db
mysql> UPDATE Members SET super_user=1 WHERE email=<your-email>;
# Press CTRL-D to exit
```
### Setting up domains
To setup domains, you need to update our domain records with whoever owns our domain. Check the google drive for information on logging in. You'll want the following configurations:
| Type | Host | Value | TTL |
| ---- | ---- | ----- | --- |
| A Record | * | `<ip address of server> `| automatic |
| A Record | @ | `<ip address of server>` | automatic |
| URL Redirect Record | www | http://ucceasambassadors.com | unmasked |
Once the domain configuration is complete, run the following commands on the server to configure dokku for receiving requests for the name
```shell
$ dokku domains:add-global ucceasambassadors.com
$ dokku domains:add amb-site ucceasambassadors.com
# Configure lets encrypt for free https
$ dokku config:set --no-restart amb-site DOKKU_LETSENCRYPT_EMAIL=ucceasamb@gmail.com
$ dokku letsencrypt amb-site
```
### Timezone Configuration
When you setup the app, it will probably have the UTC timezone as a default. Because our app doesn't handle timezones,
you should set it to be the same timezone our users are in, EST. 
This configuration is handled in dokku.
```
$ dokku config:set amb-site TZ="America/New_York"
```
Configurating this option will ensure that timing for events is correct, and
that they don't fall off the home page before they've happened.
### Securing the server
You need to disable root ssh access. Password access definitely needs disabled.

# Maintenance
**THESE COMMANDS ARE FOR THE ABOVE DESCRIBED SERVER - UBUNTU 18.04 WITH THE DOKKU DEPLOYMENT SYSTEM**
This section is for tasks that aren't building the initial server
## Setting up production access
If someone new needs access to the site, you'll need to create a new user for them on the server,
and grant them permission to do the things they need to do - if you trust them, or you have to trust
them, make the a sudoer.
```shell
$ adduser <username>
$ usermod -aG sudo <username>
```

Add their ssh Keys to the server - by adding their public key to their authorized key file. If they
don't have an ssh key, instructions for creating one can be found [here](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/).
As the user, run the following commands.
```shell
$ mkdir ~/.ssh
$ sudo chmod 0700 ~/.ssh
$ touch ~/.ssh/authorized_keys
$ sudo chmod 0600 ~/.ssh/authorized_keys
$ echo "<their-public-key-here>" >> ~/.ssh/authorized_keys
```
They should now be able to ssh into the server!

The next step is setting up their ability to deploy code to the server. On the server, you need to add
their ssh key to the dokku system.
```ssh
$ sudo usermod -aG docker <username>
```

## Updating the code running on the server
In order to update the code running on the server, you need to have dokku push access. This is managed with ssh keys.
If you're not using ssh keys with git, [now is a great time to start](https://help.github.com/articles/connecting-to-github-with-ssh/).
On the server, with your ssh-key stored in your user directory as `~/my-key.pub` (look up scp to get things onto the server).
```shell
$ dokku ssh-keys:add <my-name-<computer>> ~/my-key.pub
```
On your machine, you need to setup git to push to the remote machine
```shell
$ git remote add dokku-prod dokku@<ip>:amb-site
# now you can push code to the server and watch it build
$ git push dokku-prod master
```
## Checking the logs
You can check logs on the server for errors by using [the dokku logs command](http://dokku.viewdocs.io/dokku/deployment/logs/).
On the server:
```shell
$ dokku logs amb-site
# or, to see logs as they come in real time,
$ dokku logs amb-site -t
```
Logs do not persist forever - if you restart the container, logs could be lost!
## Backing up the database
Backing up the database is incredibly important, and should be done regularly. If something happens, such as a catastrophic failure, the database container is destroyed, or we lose contact with the server, it's important to have a backup to recover from. Reading to and from dokku database containers is easy though!

To export a dump of the database (passwords are encrypted, so it's safe)
```
dokku mysql:export amb-db > date-amb-db.dump.sql
```
Likewise, restoring from backups is easy as well
```
dokku mysql:import amb-db < date-amb-db.dump.sql
```
I typically follow the format `YYYY-MM-DD-amb-db.dump.sql` for file naming.
### Auto backup
Our backup solution chooses to send data our email to minimize the risk of losing access to data (such as in the event the website server goes down and is destroyed by our hosting provider. It has happened!). A script written in the `tools` directory generates a backup from a cronjob and sends the backup to our gmail, where the emails must be manually managed. Because we can't execute scripts in containers, the repo can also be cloned to a different directory to run the script. I copied to the `/opt/` directory. 
The script requires the `mail` command, which is configured on debian systems by the `mailutils` package. It can be autocalled using a cronjob. To setup a cron job, run `crontab -e` and enter the following:
```
0 5 * * * /opt/ceas-ambassadors-website/tools/db_backup.sh amb-db <email>
```
It is probably unwise to add the cron job as a your user. It can be added as root, or as a backup-specific user. If adding as a specific user, that user must have permission to use the `dokku` command without password authentication.
## Restarting the website
If you need to restart the server, it can be triggered through dokku. If you're restarted to recover from an error,
you should heavily consider piping logs to a file so that they can be inspected and debugged.
On the server:
```shell
# optional, but recommended for later diagnosis
$ dokku logs amb-site > ~/logs/year-month-day-log-error.log
$ dokku ps:restart amb-site
```
## Keeping the website up to date
It's a good idea to regularly update the packages running on the website. You can use APT to manage these:
```
$ sudo apt-get update
$ sudo apt-get upgrade
```
Keeping these packages up to date is necessary for the security of our server.

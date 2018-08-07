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
Sit back and relax, this takes a while. I setup dokku to use virtualhost naming, but it doesn't matter
a whole lot, you'll configure domains later.
### Dokku plugins we will need
Dokku uses plugins to manage common operations - we can actually run everything we need to in dokku
containers!
#### Persistant Storage
We will need persitent storage to store photos - they can't be stored in a docker image because
docker images are temporary. We will probably use [dokku-copy-files-to-image](https://github.com/dokku/dokku-copy-files-to-image).
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
This will be updated once we've setup the domain name.

### Securing the server
You need to disable root ssh access.

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
## Checking the logs
## Backing up the database
## Restarting the website
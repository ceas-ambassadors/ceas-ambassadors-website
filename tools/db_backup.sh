#! /bin/sh
# Check args
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Instructions for use:"
    echo "./db_backup.sh <database-name> <destination-email>"
    exit 1
fi
# Get the date to name todays backup
DATE=`date +%Y-%m-%d`

# build output filename
FILE=$DATE-$1.dump.sql

# Generate backup from first argument
dokku mysql:export $1 > $FILE

# Write and send an email to our gmail - defined in second argument
echo "See docs for instructions to restore from backup" | mail -s "Backup for $DATE" $2 -A $FILE

# clean up after execution on the server
rm $FILE
/* Change sid in Sessions to be 36 chars long */
ALTER TABLE Sessions CHANGE COLUMN sid VARCHAR(36);
ALTER TABLE amb_site_dev.members ADD is_certified BOOLEAN;
ALTER TABLE amb_site_dev.events ADD is_disabled BOOLEAN;
<<<<<<< HEAD
ALTER TABLE amb_site_dev.events ADD point_val INT ;
=======
ALTER TABLE Attendances modify column status enum('unconfirmed','confirmed','not_needed','excused');
>>>>>>> 37a4ad1cd6d47563985e49a350b4b6d2f1cbb323

/* Change sid in Sessions to be 36 chars long */
ALTER TABLE Sessions CHANGE COLUMN sid sid VARCHAR(36);
ALTER TABLE amb_site_dev.members ADD is_certified BOOLEAN;
ALTER TABLE amb_site_dev.events ADD is_disabled BOOLEAN;
ALTER TABLE Attendances modify column status enum('unconfirmed','confirmed','not_needed','excused', 'no_show');
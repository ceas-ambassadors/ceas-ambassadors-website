/* Change sid in Sessions to be 36 chars long */
ALTER TABLE Sessions CHANGE COLUMN sid VARCHAR(36);
ALTER TABLE amb_site_dev.members ADD is_certified BOOLEAN;
ALTER TABLE amb_site_dev.events ADD is_disabled BOOLEAN;
ALTER TABLE amb_site_dev.events ADD point_val INT ;
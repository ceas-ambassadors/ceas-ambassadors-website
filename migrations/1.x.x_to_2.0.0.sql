/* Change sid in Sessions to be 36 chars long */
ALTER TABLE Sessions CHANGE COLUMN sid sid VARCHAR(36);

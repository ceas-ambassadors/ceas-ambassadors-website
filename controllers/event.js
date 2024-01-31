/**
 * Controller for all event related endpoints
 */
const { check, validationResult } = require('express-validator');
const models = require('../models');

/**
 * Get details page for a specific event specified in req.params.id
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const getDetails = (req, res, next) => {
  return models.Event.findByPk(req.params.id).then((event) => {
    if (!event) {
      req.session.status = 404;
      req.session.alert.errorMessages.push('Event not found.');
      return req.session.save(() => {
        return res.redirect('/event');
      });
    }

    // Get a list of members who are signed up with some status for this event
    // It's faster to run a raw sql query than it is to run two queries in a row
    // This is because Sequelize can't do joins
    // http://docs.sequelizejs.com/manual/tutorial/raw-queries.html
    const eventAttendeesPromise = models.sequelize.query(`SELECT Members.*, Attendances.status
                                   FROM Members INNER JOIN Attendances
                                   ON Members.id = Attendances.member_id WHERE
                                   Attendances.event_id = :event_id`, {
      replacements: {
        event_id: req.params.id,
      },
      type: models.sequelize.QueryTypes.SELECT,
    });
    // create as variable to allow for modifying of search
    const memberWhere = {
      private_user: false,
    };
    if (req.user && req.user.super_user) {
      // super users can see private users
      delete memberWhere.private_user;
    }
    // get all member alphabetically sorted and return them
    const allMembersPromise = models.Member.findAll({
      where: memberWhere,
      order: [
        ['last_name', 'ASC'],
        ['first_name', 'ASC'],
      ],
    });
    return Promise.all([eventAttendeesPromise, allMembersPromise]).then(([members, allMembers]) => {
      // if it is a private event and the current member is not on the attendee list - they cannot
      // see event details
      // super users can see all events
      if (event.public !== true) {
        if (!req.user.super_user) {
          let found = false;
          for (let idx = 0; idx < members.length; idx += 1) {
            if (members[idx].email === req.user.email) {
              found = true;
              break;
            }
          }
          if (!found) {
            // This member can't see this event because they're not a super user and not on list
            req.session.status = 403;
            req.session.alert.errorMessages.push('You are not an attendee for the private event.');
            return req.session.save(() => {
              return res.redirect('/event');
            });
          }
        }
        // If we get this far, we should notify the super user or member attending
        // that the meeting is a private meeting
        res.locals.alert.infoMessages.push('This event is private. It is only visible to attendees and super users.');
      }
      // members is not an array of full members - it only has the above selected attrs + status
      const confirmedAttendees = [];
      const notNeededAttendees = [];
      const unconfirmedAttendees = [];
      const excusedAttendees = [];
      const noShowAttendees = [];
      const membersNotSignedUp = allMembers;
      const numSignUps = members.length;
      // Separate members into confirmed, not needed, and unconfirmed
      for (let i = 0; i < members.length; i += 1) {
        if (members[i].status === models.Attendance.getStatusConfirmed()) {
          confirmedAttendees.push(members[i]);
        } else if (members[i].status === models.Attendance.getStatusNotNeeded()) {
          notNeededAttendees.push(members[i]);
        } else if (members[i].status === models.Attendance.getStatusExcused()) {
          excusedAttendees.push(members[i]);
        } else if (members[i].status === models.Attendance.getStatusNoShow()) {
          noShowAttendees.push(members[i]);
        } else {
          unconfirmedAttendees.push(members[i]);
        }
      }
      // build list of members for showing to non-logged in users
      const unconfirmedAndConfirmedAttendees = unconfirmedAttendees.concat(confirmedAttendees);
      return res.status(res.locals.status).render('event/detail', {
        title: event.title,
        event, // shorthand for event: event,
        numSignUps,
        membersNotSignedUp,
        unconfirmedAttendees,
        notNeededAttendees,
        excusedAttendees,
        noShowAttendees,
        confirmedAttendees,
        unconfirmedAndConfirmedAttendees,
      });
    });
  }).catch(next);
};
exports.getDetails = getDetails;

/**
 * GET for event list page
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const getList = (req, res, next) => {
  // define where part of queries
  const eventWhere = {
    public: true,
    meeting: false,
  };
  const meetingWhere = {
    public: true,
    meeting: true,
  };
  // should private events be shown? yes for super users
  if (req.user && req.user.super_user) {
    delete eventWhere.public;
    delete meetingWhere.public;
  }
  // query for all events
  const eventPromise = models.Event.findAll({
    where: eventWhere,
    order: [
      ['start_time', 'ASC'],
    ],
  });

  const meetingPromise = models.Event.findAll({
    where: meetingWhere,
    order: [
      ['start_time', 'ASC'],
    ],
  });

  return Promise.all([eventPromise, meetingPromise]).then((output) => {
    return res.status(res.locals.status).render('event/list', {
      title: 'Events',
      events: output[0],
      meetings: output[1],
    });
  }).catch(next);
};
exports.getList = getList;

/**
 * GET for the create event page
 */
const getCreate = (req, res) => {
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to create an event.');
    return req.session.save(() => {
      return res.redirect('/event');
    });
  }
  // Check for super user status
  if (!req.user.super_user) {
    req.session.status = 403;
    req.session.alert.errorMessages.push('You must be a super user to create events.');
    return req.session.save(() => {
      return res.redirect('/event');
    });
  }

  return res.status(res.locals.status).render('event/create', {
    title: 'Create Event',
  });
};
exports.getCreate = getCreate;

/**
 * POST for the create event page - Also handles page edits
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 * @description Expects the following req.body objects:
 * `title`, `startTime`, `endTime`, `location`, `description`, `isMeeting`, `isPublic`
 */
const postCreateEdit = [
  check('title').not().isEmpty().withMessage('A title must be set.'),
  check('startTime').not().isEmpty().withMessage('A start time must be supplied.'),
  check('endTime').not().isEmpty().withMessage('An end time must be supplied.'),
  check('location').not().isEmpty().withMessage('A location must be set.'),
  (req, res, next) => {
    // Ensure a user is making the request
    if (!req.user) {
      req.session.status = 401;
      req.session.alert.errorMessages.push('You must be logged in to create an event.');
      return req.session.save(() => {
        return res.redirect('/event');
      });
    }

    // Check for super user status
    if (!req.user.super_user) {
      req.session.status = 403;
      req.session.alert.errorMessages.push('You must be a super user to create events.');
      return req.session.save(() => {
        return res.redirect('/event');
      });
    }

    // determine redirect url for errors based on data coming from  UI
    let redirectUrl = '/event/create';
    if (req.body.isEdit === 'true') {
      redirectUrl = `/event/${req.body.eventId}/edit`;
    }

    const errors = validationResult(req).formatWith(({ msg }) => { return `${msg}`; });
    if (!errors.isEmpty()) {
      // There was a validation error
      req.session.status = 400;
      // add errors as individual elements
      req.session.alert.errorMessages.push(...errors.array());
      // render create page
      return req.session.save(() => {
        return res.redirect(redirectUrl);
      });
    }

    // Convert string times to Date objects
    const startTime = Date.parse(req.body.startTime);
    const endTime = Date.parse(req.body.endTime);

    // check for invalid start/end times
    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
      if (Number.isNaN(startTime)) {
        req.session.alert.errorMessages.push('The start time is not a valid time.');
      }
      if (Number.isNaN(endTime)) {
        req.session.alert.errorMessages.push('The end time is not a valid time.');
      }
      req.session.status = 400;
      return req.session.save(() => {
        return res.redirect(redirectUrl);
      });
    }
    // Return error if the start time is after the end time
    if (startTime >= endTime) {
      req.session.alert.errorMessages.push('The end time must be after the start time.');
      req.session.status = 400;
      return req.session.save(() => {
        return res.redirect(redirectUrl);
      });
    }

    // disallow events that are longer than 24 hours
    const lengthLimit = 24 * 60 * 60 * 1000;
    if (endTime - startTime > lengthLimit) {
      req.session.alert.errorMessages.push('The maximum allowed event length is 24 hours.');
      req.session.status = 400;
      return req.session.save(() => {
        return res.redirect(redirectUrl);
      });
    }

    // If the start time is before now and it's not an edit, make sure the user knows with an
    // info message
    if (startTime < Date.now() && req.body.isEdit !== 'true') {
      req.session.alert.infoMessages.push('This event was created in the past.');
    }

    // handle isPublic and isMeeting flags
    let isPublic = false;
    let isMeeting = false;
    let isDisabled = false;
    if (req.body.isPublic === 'on') {
      isPublic = true;
    }
    if (req.body.isMeeting === 'on') {
      isMeeting = true;
    }
    if (req.body.isDisabled === 'on') {
      isDisabled = 1;
    }

    if (req.body.isEdit === 'true') {
      return models.Event.findByPk(req.body.eventId).then((event) => {
        // For edits, switching between meetings and non-meetings is disallowed
        if (isMeeting !== event.meeting) {
          // The UI doesn't even display meeting check box, so just set it back to the default
          // value quietly
          isMeeting = event.meeting;
        }

        // update the event object
        return event.update({
          title: req.body.title,
          start_time: startTime,
          end_time: endTime,
          description: req.body.description,
          location: req.body.location,
          public: isPublic,
          meeting: isMeeting,
          created_by: req.user.id,
          is_disabled: isDisabled,
          sign_up_limit: req.body.signUpLimit,
        }).then(() => {
          req.session.status = 201;
          req.session.alert.successMessages.push('Event updated!');
          return req.session.save(() => {
            return res.redirect(`/event/${req.body.eventId}`);
          });
        }).catch(next);
      });
    }
    // not edit - create the event
    return models.Event.create({
      title: req.body.title,
      start_time: startTime,
      end_time: endTime,
      description: req.body.description,
      location: req.body.location,
      sign_up_limit: req.body.signUpLimit,
      public: isPublic,
      meeting: isMeeting,
      created_by: req.user.id,
    }).then((event) => {
      // the event was succesfully created!
      req.session.status = 201;
      req.session.alert.successMessages.push('Event created!');
      return req.session.save(() => {
        return res.redirect(`/event/${event.id}`);
      });
    }).catch(next);
  },
];
exports.postCreateEdit = postCreateEdit;

const getSave = (req, res) => {
  return req.session.save(() => {
    return res.redirect(`/event/${req.params.id}`);
  });
};
exports.getSave = getSave;

/**
 * GET for the change attendance status page
 */
const getAttendanceStatus = (req, res, next) => {
  return models.Event.findByPk(req.params.id).then((event) => {
    if (!event) {
      req.session.status = 404;
      req.session.alert.errorMessages.push('Event not found.');
      return req.session.save(() => {
        return res.redirect('/event');
      });
    }

    // Get a list of members who are signed up with some status for this event
    // It's faster to run a raw sql query than it is to run two queries in a row
    // This is because Sequelize can't do joins
    // http://docs.sequelizejs.com/manual/tutorial/raw-queries.html
    const eventAttendeesPromise = models.sequelize.query(`SELECT Members.*, Attendances.status
                                   FROM Members INNER JOIN Attendances
                                   ON Members.id = Attendances.member_id WHERE
                                   Attendances.event_id = :event_id`, {
      replacements: {
        event_id: req.params.id,
      },
      type: models.sequelize.QueryTypes.SELECT,
    });

    // create as variable to allow for modifying of search
    const memberWhere = {
      private_user: false,
    };
    if (req.user && req.user.super_user) {
      // super users can see private users
      delete memberWhere.private_user;
    }

    const allMembersPromise = models.Member.findAll({
      where: memberWhere,
      order: [
        ['last_name', 'ASC'],
        ['first_name', 'ASC'],
      ],
    });

    return Promise.all([eventAttendeesPromise, allMembersPromise]).then(([members, allMembers]) => {
      // members is not an array of full members - it only has the above selected attrs + status
      const confirmedAttendees = [];
      const notNeededAttendees = [];
      const unconfirmedAttendees = [];
      const excusedAttendees = [];
      const noShowAttendees = [];
      const membersNotSignedUp = allMembers;
      // Separate members into confirmed, not needed, and unconfirmed
      for (let i = 0; i < members.length; i += 1) {
        if (members[i].status === models.Attendance.getStatusConfirmed()) {
          confirmedAttendees.push(members[i]);
        } else if (members[i].status === models.Attendance.getStatusNotNeeded()) {
          notNeededAttendees.push(members[i]);
        } else if (members[i].status === models.Attendance.getStatusExcused()) {
          excusedAttendees.push(members[i]);
        } else if (members[i].status === models.Attendance.getStatusNoShow()) {
          noShowAttendees.push(members[i]);
        } else {
          unconfirmedAttendees.push(members[i]);
        }
      }
      // build list of members for showing to non-logged in users
      const unconfirmedAndConfirmedAttendees = unconfirmedAttendees.concat(confirmedAttendees);

      return res.status(res.locals.status).render('event/attendanceStatus', {
        title: event.title,
        event, // shorthand for event: event,
        members,
        membersNotSignedUp,
        unconfirmedAttendees,
        notNeededAttendees,
        excusedAttendees,
        noShowAttendees,
        confirmedAttendees,
        unconfirmedAndConfirmedAttendees,
      });
    });
  }).catch(next);
};
exports.getAttendanceStatus = getAttendanceStatus;

/**
 * POST to a signup page with an event with req.params.id id.
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const postSignup = (req, res, next) => {
  // Make sure the user is signed in
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to signup');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }

  // Get the event
  const eventPromise = models.Event.findByPk(req.params.id);

  // Get the member
  let memberEmail = null;
  // If the current user is a super user, they can specify a member
  // Super user tests
  if (req.body.email) {
    if (req.user.super_user) {
      memberEmail = req.body.email;
    } else {
      // You can't specify email via post and not be a super user
      req.session.status = 403;
      req.session.alert.errorMessages.push('You must be a super user to specify a member.');
      return req.session.save(() => {
        return res.redirect(`/event/${req.params.id}`);
      });
    }
  } else {
    memberEmail = req.user.email;
  }

  // Check if it's a full email or a 6+2
  // Append @mail.uc.edu if it's just a 6+2
  if (!memberEmail.includes('@')) {
    memberEmail += '@mail.uc.edu';
  }

  const memberPromise = models.Member.findOne({
    where: {
      email: memberEmail,
    },
  });

  // Once member and event have been found, continue with creating the attendance entry
  return Promise.all([eventPromise, memberPromise]).then((output) => {
    // output is in order of array
    const event = output[0];
    const member = output[1];

    if (!member) {
      // member not found - return 400 because a bad email was sent
      req.session.status = 400;
      req.session.alert.errorMessages.push('Specified member could not be found.');
      return req.session.save(() => {
        return res.redirect(`/event/${req.params.id}`);
      });
    }

    // Need to pull attendance record - a member cannot be signed up for an event for which
    // they're already signed up
    return models.Attendance.findOne({
      where: {
        member_id: member.id,
        event_id: event.id,
      },
    }).then((attendance) => {
      // If the event is a meeting or private, only super users can sign up for it
      if ((event.meeting === true || event.public !== true) && !req.user.super_user) {
        req.session.status = 403;
        req.session.alert.errorMessages.push('A super user must sign you up for this event.');
        return req.session.save(() => {
          // not safe to redirect to a private event
          if (event.public !== true) {
            return res.redirect('/event');
          }
          // safe to redirect to details page
          return res.redirect(`/event/${req.params.id}`);
        });
      }

      // If attendance exists there is no need to continue because you can't re-signup
      if (attendance) {
        req.session.status = 400;
        req.session.alert.errorMessages.push(`${memberEmail} is already signed up for this event.`);
        return req.session.save(() => {
          return res.redirect(`/event/${event.id}`);
        });
      }
      let status = models.Attendance.getStatusUnconfirmed();
      if (event.meeting) {
        status = models.Attendance.getStatusConfirmed();
      }
      if (!event.public) {
        // Private events are automatically confirmed because they're entered by a super user
        status = models.Attendance.getStatusConfirmed();
      }

      // Create attendance
      return models.Attendance.create({
        event_id: req.params.id,
        member_id: member.id,
        status, // shorthand for status: status,
      }).then(() => {
        req.session.status = 201;
        req.session.alert.successMessages.push(`Signed up for ${event.title}`);
        return req.session.save(() => {
          return res.redirect(`/event/${event.id}`);
        });
      });
    });
  }).catch(next);
};
exports.postSignup = postSignup;

/**
 * Removes the sign-up for an event specified by req.params.id
 * Only accessible by super users
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const postRemoveSignUp = (req, res, next) => {
  // Make sure the user is signed in
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to delete your sign-up.');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }

  const eventAttendancePromise = models.Attendance.findOne({
    where: {
      member_id: req.user.id,
      event_id: req.params.id,
    },
  });

  const eventPromise = models.Event.findByPk(req.params.id);

  return Promise.all([eventAttendancePromise, eventPromise]).then(([attendance, event]) => {
    if (!attendance) {
      req.session.status = 404;
      req.session.alert.errorMessages.push('Sign-up not found.');
      return req.session.save(() => {
        return res.redirect(`/event/${req.params.id}`);
      });
    }

    const cDate = new Date().getTime();
    const eDate = event.start_time.getTime();

    if (eDate - cDate <= 2.592e8) {
      req.session.status = 403;
      req.session.alert.errorMessages.push('Sign-ups cannot be removed within 72 hours of an event.');
      return req.session.save(() => {
        return res.redirect(`/event/${req.params.id}`);
      });
    }

    return attendance.destroy().then(() => {
      req.session.alert.successMessages.push('Sign-up deleted succesfully.');
      return req.session.save(() => {
        return res.redirect(`/event/${req.params.id}`);
      });
    });
  }).catch(next);
};
exports.postRemoveSignUp = postRemoveSignUp;

/**
 * POST endpoint for confirming members for events
 * Inputs:
 * parameter id: event id
 * query member: member email to confirm status of
 * query status: status to change confirmed meeting to. Allowable values
 *    ['confirmed', 'notNeeded', 'denied']
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const postChangeAttendance = (req, res, next) => {
  // Make sure the user is signed in
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to confirm attendance.');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }

  // Make sure the user is a super user
  if (!req.user.super_user) {
    req.session.status = 403;
    req.session.alert.errorMessages.push('You must be a super user to confirm attendance.');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }

  // check that a member email and status were specified
  if (!req.query.member || !req.query.status) {
    req.session.status = 400;
    req.session.alert.errorMessages.push('Member and status must be specified.');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }
  // constants sent by ui
  const confirmedConstant = 'confirmed';
  const notNeededConstant = 'notNeeded';
  const excusedConstant = 'excused';
  const noShowConstant = 'noShow';
  // Check that the value of the status query is valid
  if (req.query.status !== confirmedConstant && req.query.status !== notNeededConstant
    && req.query.status !== excusedConstant && req.query.status !== noShowConstant) {
    req.session.status = 400;
    req.session.alert.errorMessages.push('Incorrect value for status. Please use UI buttons.');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }
  // find the relevant attendance record and update it accordingly
  return models.Attendance.findOne({
    where: {
      member_id: req.query.member,
      event_id: req.params.id,
    },
  }).then((attendance) => {
    if (!attendance) {
      req.session.status = 404;
      req.session.alert.errorMessages.push('Attendance record not found. Please retry.');
      return req.session.save(() => {
        return res.redirect(`/event/${req.params.id}`);
      });
    }
    // attendance record was found
    // confirmed option
    if (req.query.status === confirmedConstant) {
      return attendance.update({
        status: models.Attendance.getStatusConfirmed(),
      }).then(() => {
        return res.redirect(`/event/${req.params.id}/attendanceStatus`);
      });
    }
    // excuse option
    if (req.query.status === excusedConstant) {
      return attendance.update({
        status: models.Attendance.getStatusExcused(),
      }).then(() => {
        return res.redirect(`/event/${req.params.id}/attendanceStatus`);
      });
    }
    // not needed option
    if (req.query.status === notNeededConstant) {
      return attendance.update({
        status: models.Attendance.getStatusNotNeeded(),
      }).then(() => {
        return res.redirect(`/event/${req.params.id}/attendanceStatus`);
      });
    }
    // destroy attendance record since it's unneeded
    if (req.query.status === noShowConstant) {
      return attendance.update({
        status: models.Attendance.getStatusNoShow(),
      }).then(() => {
        return res.redirect(`/event/${req.params.id}/attendanceStatus`);
      });
    }
    // code should not get here
    throw Error('Attendance status wasnt updated.');
  }).catch(next);
};
exports.postChangeAttendance = postChangeAttendance;

/**
 * POST endpoint for confirming members for events
 * Inputs:
 * parameter id: event id
 * query member: member email to confirm status of
 * query status: status to change confirmed meeting to. Allowable values
 *    ['confirmed', 'notNeeded', 'denied']
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const postConfirmAttendance = (req, res, next) => {
  // Make sure the user is signed in
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to confirm attendance.');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }

  // Make sure the user is a super user
  if (!req.user.super_user) {
    req.session.status = 403;
    req.session.alert.errorMessages.push('You must be a super user to confirm attendance.');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }

  // check that a member email and status were specified
  if (!req.query.member || !req.query.status) {
    req.session.status = 400;
    req.session.alert.errorMessages.push('Member and status must be specified.');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }
  // constants sent by ui
  const confirmedConstant = 'confirmed';
  const notNeededConstant = 'notNeeded';
  const excusedConstant = 'excused';
  const noShowConstant = 'noShow';
  // Check that the value of the status query is valid
  if (req.query.status !== confirmedConstant && req.query.status !== notNeededConstant
    && req.query.status !== excusedConstant && req.query.status !== noShowConstant) {
    req.session.status = 400;
    req.session.alert.errorMessages.push('Incorrect value for status. Please use UI buttons.');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }
  // find the relevant attendance record and update it accordingly
  return models.Attendance.findOne({
    where: {
      member_id: req.query.member,
      event_id: req.params.id,
    },
  }).then((attendance) => {
    if (!attendance) {
      req.session.status = 404;
      req.session.alert.errorMessages.push('Attendance record not found. Please retry.');
      return req.session.save(() => {
        return res.redirect(`/event/${req.params.id}`);
      });
    }
    // attendance record was found
    // confirmed option
    if (req.query.status === confirmedConstant) {
      return attendance.update({
        status: models.Attendance.getStatusConfirmed(),
      }).then(() => {
        return res.redirect(`/event/${req.params.id}`);
      });
    }
    // excuse option
    if (req.query.status === excusedConstant) {
      return attendance.update({
        status: models.Attendance.getStatusExcused(),
      }).then(() => {
        return res.redirect(`/event/${req.params.id}`);
      });
    }
    // not needed option
    if (req.query.status === notNeededConstant) {
      return attendance.update({
        status: models.Attendance.getStatusNotNeeded(),
      }).then(() => {
        return res.redirect(`/event/${req.params.id}`);
      });
    }
    // no show option
    if (req.query.status === noShowConstant) {
      return attendance.update({
        status: models.Attendance.getStatusNoShow(),
      }).then(() => {
        return res.redirect(`/event/${req.params.id}`);
      });
    }
    // code should not get here
    throw Error('Attendance status wasnt updated.');
  }).catch(next);
};
exports.postConfirmAttendance = postConfirmAttendance;

/**
 * Deletes the event specified by req.params.id
 * Only accessible by super users
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const postDelete = (req, res, next) => {
  // Make sure the user is signed in
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to delete events.');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }

  // Check if super user
  if (!req.user.super_user) {
    req.session.status = 403;
    req.session.alert.errorMessages.push('You must be a super user to delete events.');
    return req.session.save(() => {
      return res.redirect('/event');
    });
  }

  return models.Event.findByPk(req.params.id).then((event) => {
    if (!event) {
      // event was not found - 404
      req.session.status = 404;
      req.session.alert.errorMessages.push('Event not found.');
      return req.session.save(() => {
        return res.redirect('/event');
      });
    }
    return event.destroy().then(() => {
      // return to event listings
      req.session.alert.successMessages.push('Event deleted succesfully.');
      return req.session.save(() => {
        return res.redirect('/event');
      });
    });
  }).catch(next);
};
exports.postDelete = postDelete;

/**
 * Get UI for editing events
 * @param {*} req - incoming request
 * @param {*} res - outgoing response
 */
const getEdit = (req, res, next) => {
  // make sure there is a user
  if (!req.user) {
    req.session.status = 401;
    req.session.alert.errorMessages.push('You must be logged in to edit events.');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }

  // only super users can edit events
  if (!req.user.super_user) {
    req.session.status = 403;
    req.session.alert.errorMessages.push('You must be a super user toe dit events.');
    return req.session.save(() => {
      return res.redirect(`/event/${req.params.id}`);
    });
  }
  // get event
  return models.Event.findByPk(req.params.id).then((event) => {
    if (!event) {
      req.session.status = 404;
      req.session.alert.errorMessages.push('Event not found.');
      return req.session.save(() => {
        return res.redirect('/event');
      });
    }

    // render event create page with arguments for making it an event edit page
    return res.status(res.locals.status).render('event/create', {
      title: 'Edit Event',
      event, // shorthand for event: event,
      isEdit: true,
    });
  }).catch(next);
};
exports.getEdit = getEdit;

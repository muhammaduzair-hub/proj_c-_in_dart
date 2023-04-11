const JobSource = {
  CLOUD: "cloud",
  USB: "usb"
};
Object.freeze(JobSource);

const JobSourceToShow = {
  ALL: "all",
  CLOUD: "cloud",
  USB: "usb"
}
Object.freeze(JobSourceToShow);

const LAYOUT_DICT = {
  "center": "center",
  "corner,side": "corner,side",
  "two_corners": "2 corners",
  "two_corners_outside": "2 corners",
  "two_middle_goal_posts": "2 goal posts",
  "two_end_goal_posts": "2 goal posts",
  "two_corners,side": "2 corners,side",
  "all_corners": "4 corners",
  "all_goal_posts": "4 goal posts",
  "all_corners,all_goal_posts": "4 corners,4 goal posts",
  "two_ends": "2 ends",
  "n_ends": "N ends",
  "two_end_goal_posts_resize": "single_post",

  // Atletics
  "center,throwdirection": "circle center,kickboard",
  "center,landingsector_end": "circle center,corner",
  "all_points": "circle center,kickboard,corner",

  // Running track
  "run_inner_corner,side": "inner,corner,side",
  "run_inner_two_corners,side": "inner,corner,2 sides",
  "run_outer_corner,side": "outer,corner,side",
  "run_outer_two_corners,side": "outer,corner,2 sides",

  // Rounders
  "fixed_corners": "Fixed corners",

  // Sprint
  "start,goal": "Start line,Goal line",

  //Softball and Baseball
  "corner,2_sides": "corner,2_sides",
  "corner,2_posts": "corner,2_posts"

};
Object.freeze(LAYOUT_DICT);

const screenTimeoutSettings = {
  0: 30, // 30 seconds
  1: 60, // 1 minute
  2: 120, // 2 minutes
  3: 300, // 5 minutes
  4: 600, // 10 minutes
  5: 1800, // 30 minutes
  6: 3600, // 1 hour
  7: null // Never
}
Object.freeze(screenTimeoutSettings);

const lowPowerSettings = {
  0: 180, // 3 minutes
  1: 600, // 10 minutes
  2: 1800, // 30 minutes
  3: 3600, // 1 hour
  4: 7200, // 2 hours
  5: 10800, // 3 hours
  6: 14400, // 4 hours
  7: null // Never
}
Object.freeze(lowPowerSettings);

/**
 * Error objects for the error indicator to show.
 * "message" is the text displayed on screen.
 * "code" is a unique identifier for a given error.
 * Errors with higher "severity" are shown before other errors.
 * "condition" is a check for whether or not the error should be shown at all.
 * Delay is the amount of time to wait before showing the error
 */
const indicatorErrors = {
  NO_INTERNET: {message: "No tablet internet", code: 1001, severity: 5, condition: "show_offline_indicator", delay: 1},
  NO_APP_SERVER_CONNECTION: {message: "No server connection", code: 1002, severity: 4, condition: "show_offline_indicator", delay: 1},
  NO_ROBOT_CONNECTION: {message: "No connection to the robot", code: 1003, severity: 4, condition: "always", delay: 1},
  ROBOT_TILTED: {message: "Robot tilted", code: 2002, severity: 5, condition: "always"},
  ROBOT_NO_REMOTE: {message: "No remote controller connection", code: 2001, severity: 4, condition: "always"},
  ROBOT_NO_POS: {message: "Robot has no position fix", code: 2003, severity: 3, condition: "always"},
  ROBOT_RECOVERING: {message: "Robot is recovering from an error", code: 2004, severity: 2, condition: "always"},
}
Object.freeze(indicatorErrors);
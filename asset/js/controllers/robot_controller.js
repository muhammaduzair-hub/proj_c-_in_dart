
/* global communication_controller, wifi_controller, top_bar_screen_controller, event_controller, message_controller, Infinity, projection_controller, blue, developer_screen, pitch_generator, file_loader_screen, map_controller, settings_screeen_controller, time, pt */


const TopStates = {
  UNDEFINED : -1,
  INIT : 1,
  MANUAL : 2,
  AUTOMATIC : 3,
  AUTOMATIC_OFF : 4,  // Deadman released
  ERROR_HARD : 5,
  ERROR_USER_WAIT : 6,
  ERROR_ACK : 7,  // Try to recover running state
  ERROR_RESOLVED : 8,  // Error state has been recovered
  ERROR_SOFT : 9,  // Soft error, continue when gone
  BASE_MODE : 10
}
Object.freeze(TopStates)

class Robot
{
  constructor( name, id )
  {
    this.name = name;
    this.id = id;
    this.bmac = "";
    this._proj_string = "";
    this.x = 0;
    this.y = 0;
    this.long = 0;
    this.lat = 0;
    this.t = 0;
    this.precision = 666e6;
    this._projector;
    this._proj_alias = "";
    this._projection = ""; // either an alias or a proj4 string
    this.last_time = 0;
    this.projectionLock = new CountedIdSemophor();
  }
  set projection( val )
  {
    if( val === this._projection || val === this._proj_string )
      return;

    if( projection_controller.projections[val] )
      val = projection_controller.projections[val];

    if( val === this._projection || val === this._proj_string )
      return;

    this._projection = val;
    this._proj_string = val;

    if( val.indexOf( "+tmr_alias" ) < 0 )
    {
      this._proj_string = projection_controller.get_proj_string( val );
    }
    this._projector = Projector( this._proj_string );

    if( projection_controller.isNone( this.projection ) )
      this._proj_alias = this.projection;
    else
      this._proj_alias = this.projector.pr.getValue( "+tmr_alias" );

    if( !this._proj_alias )
      this._proj_alias = this.projection;
  }
  get projection()
  {
    return this._projection;
  }
  get projector()
  {
    return this._projector;
  }
  set projector( v )
  {
    this._projector = v;
  }
  get pos()
  {
    return new Vector( this.x, this.y );
  }
  set pos( v )
  {
    this.x = v.x;
    this.y = v.y;
  }
  get longlat()
  {
    return [ this.long, this.lat ];
  }
  set latlong( v )
  {
    this.long = v[0];
    this.lat = v[1];
  }
  loadKeys( r )
  {
    (Object.keys( r )).forEach( ( rkey ) =>
    {
      this[rkey] = r[rkey];
    } );
  }
  get online()
  {
    var is_online = !!this.online_cloud;
    //if ( blue.connect_to === robot_controller.robots[r.id].bmac )
    if( robot_controller.chosen_robot_id === this.id )
      if( blue.socket_confirmed )
        is_online = true;
    if( developer_screen.force_robot_online )
      is_online = true;
    return is_online;
  }
  set online( v )
  {
    console.warn( "someone says the robot is online=" + v + " the wrong way." );
  }
  get online_bluetooth()
  {
    if( blue.connect_to === this.bmac )
      if( blue.socket_confirmed )
        return true;
    return false;
  }
  get proj_string()
  {
    if(totalstation_location_controller.active && totalstation_location_controller.active.projection)
      return totalstation_location_controller.active.projection;
    return this._proj_string;
  }
  set proj_string( val )
  {
    console.warn( "proj string is not set anymore, but is calculated from projection" );
  }
  get proj_alias()
  {
    return this._proj_alias;
  }
  get user_state()
  {
    return robot_controller.user_state;
  }
  get top_state()
  {
    return robot_controller.state_top;
  }
  get in_auto()
  {
    return this.top_state === TopStates.AUTOMATIC;
  }
  get projection_change_allowed()
  {
    if(this.projectionLock.locked)
    {
      return false;
    }
    else if(this.user_state === TopStates.MANUAL)
    {
      // Robot has been online, and last known state was MANUAL
      return true;
    }
    else if(this.user_state === TopStates.UNDEFINED)
    {
      // Robot has never been online
      return true;
    }
    else
    {
      return false;
    }
  }
}

var robot_controller = {
// timers and intervals
  position_update_timer: '',
  deadman_sender: 0,
  // variables
  robots: {},
  chosen_robot_id: null,
  plot_config: {},
  config: {},
  task_info: {
    "Job name": "",
    "Task name": "",
    "Task count": 0,
    "Original task idx": 0,
    "Original task pct": 0
  },
  state_top: TopStates.UNDEFINED, // initial
  _user_state: TopStates.UNDEFINED, // initial
  get user_state() {
    return robot_controller._user_state;
  },
  set user_state(v) {
    this._user_state = v;
    joystickScreenController.update();
  },
  system_level: 1, // warning
  _system_message: "Robot software too old",
  get system_message() {
    return this._system_message;
  },
  set system_message(message) {
    if (this.messageHasChanged(message)) {
      this._system_message = message;
      this.on_new_robot_message(message);
    }
  },
  messageHasChanged(message) {
    if (message !== this.system_message) {
      return true;
    }
    return false;
  },
  display_lines: [ "", "", "", "" ],
  // Callbacks
  plot_configutation_updated: function()
  {},
  battery_level_updated: function()
  {},
  user_login_success: function()
  {},
  user_login_failure: function()
  {},
  robot_list_updated: function( server )
  {},
  user_configuration_updated: function()
  {},
  task_info_updated_callback: function()
  {},
  on_system_diag_change: ()=>{
  },
  on_new_robot_message(message) {
    this.handleErrorMessage(message);
  },
  handleErrorMessage() {
    this.removeAllErrors();
    switch (robot_controller.system_message) {
      case "Robot tilted":
        errorIndicatorController.addError(indicatorErrors.ROBOT_TILTED);
        break;
      case "No remotecontroller":
        if (robot_controller.user_state === TopStates.MANUAL) {
          errorIndicatorController.addError(indicatorErrors.ROBOT_NO_REMOTE);
        }
        break;
      case "GNSS: Invalid input":
      case "No data from GNSS":
        errorIndicatorController.addError(indicatorErrors.ROBOT_NO_POS);
        break;
      // case "Recovering":
      //   errorIndicatorController.addError(indicatorErrors.ROBOT_RECOVERING);
      //   break;
      default:
        this.removeAllErrors();
        break;
    }
  },
  removeAllErrors() {
    errorIndicatorController.removeByGroup(2);
  },
  paintIndicatorWarning() {
    if (SETTINGS.showPaintSystemWarning) {
      audioController.list.noPaint.play();
      popup_screen_controller.confirm_popup_with_options({
        header: translate["NoPaintWarningHeader"],
        body: translate["NoPaintWarningBody"].format("<br><br>"),
        ok_text: translate["OK"],
        ok_callback: () => {
          popup_screen_controller.close("no_paint_warning");
        },
        cancel_text: translate["remindMe"],
        cancel_callback: robot_controller.paintWarningOff,
        popup_name: "no_paint_warning",
      });
    }
  },
  paintWarningOff() {
    SETTINGS.showPaintSystemWarning = false;
    popup_screen_controller.close("no_paint_warning");
  },
  /**
   * 
   * @param {Integer} id 
   * @returns {Job}
   */
  get_db_job(id) {
    return map_controller.background.jobs.get_db_job(id);
  },

  replace_job(id, new_job) {
    return map_controller.background.jobs.replace_job( id, new_job );
  },
  
  get_all_jobs() {
    return this.jobs;
  },

  get_all_tasks( active_jobs ) {
    return map_controller.background.jobs.get_all_tasks( active_jobs );
  },

  get_job(id) {
    return map_controller.background.jobs.get_job( id );
  },

  get_robot_db_data: function( robot, key )
  {
    communication_controller.send( 'get_robot_db_data', {
      robot: robot,
      key: key
    }, "cloud", 10 );
  },
  clean_robot_db_data: function( robot )
  {
    communication_controller.send( 'clean_robot_db_data', {
      robot: robot
    }, "cloud", 10 );
  },
  // functions
  robot_list: function()
  {
    return Object.keys( robot_controller.robots ).map( function( e )
    {
      return robot_controller.robots[e];
    } );
  },
  get_robots: function( server )
  {
    communication_controller.send( "robots", {}, server || "cloud", 5 );
  },
  is_robot_online: function( id )
  {
    return !!(robot_controller.robots[id] && robot_controller.robots[id].online);
  },
  disconnect_robots: function( server, robot )
  {
    var something_changed = false;
    robot_controller.robot_list( ).forEach( function( r )
    {
      if( server === "cloud" )
      {
        if( r.online_cloud )
          something_changed = true;
        r.online_cloud = false;
      }
      else
      {
        if( r.online_local )
          something_changed = true;
        r.online_local = false;
      }
    } );
    console.log( "disconnected robots, did something change", something_changed );
    if( something_changed )
    {
      event_controller.call_callback( "robot_list_updated" );
      event_controller.call_callback( "robot_now_offline" );
    }
  },
  try_choose_old_robot()
  {

    var choose_robot = parseInt( localStorage.getItem( "robot.chosen" ) );
    if( choose_robot )
    {
      robot_controller.choose_robot( choose_robot );  
      blue.connect_to_robot();
    }

  },
  choose_robot: function( robot_id )
  {
    communication_controller.connectToRobot( robot_id );
  },
  deselect_robot: function()
  {
    robot_controller.manual_mode();
    communication_controller.disconnectFromRobot();
  },
  get no_robot()
  {
    const r = new Robot( "No Robot", -1 );
    r.version_numbers = [ Infinity, 0, 0 ];
    return r;
  },
  /**
   * @returns {Robot} Chosen robot
   */
  get chosen_robot()
  {
    //console.log("getting robot",robot_controller.chosen_robot_id)
    //console.log(robot_controller.robots)

    if( robot_controller.robots[robot_controller.chosen_robot_id] )
    {
      var r = robot_controller.robots[robot_controller.chosen_robot_id];
      r.online_cloud = r.online_cloud && communication_controller.appServerConnection.connected;
      r.online_local = false;//r.online && wifi_controller.robot_signal_strength > -80 && wifi_controller.current_ssid === robot_controller.chosen_robot_id;
      //r.online = r.online_cloud || r.online_local;
      return robot_controller.robots[robot_controller.chosen_robot_id];
    }
    else
    {
      return robot_controller.no_robot;
    }

  },
  get is_chosen_none()
  {
    return projection_controller.isNone( robot_controller.chosen_robot.projection );
  },
  get chosen_robot_version()
  {
    /*var version_string = robot_controller.chosen_robot.version;
     if ( !version_string )
     return [0, 0];
     var versions = version_string.replace( "RS", "" ).split( "." );
     return [parseInt( versions[0] ), parseInt( versions[1] )];
     */
    return robot_controller.chosen_robot.version_numbers;
  },
  chosen_robot_last_online_state: undefined,
  chosen_robot_online_change: function()
  {
    if( robot_controller.chosen_robot_last_online_state !== robot_controller.chosen_robot.online )
    {
      robot_controller.chosen_robot_last_online_state = robot_controller.chosen_robot.online;
      event_controller.call_callback( "chosen_robot_online_changed", robot_controller.chosen_robot_last_online_state );
      console.log( "Chosen robot online state changed to", robot_controller.chosen_robot_last_online_state );
      if( robot_controller.chosen_robot_last_online_state )
        event_controller.call_callback( "robot_now_online" );
      else
        event_controller.call_callback( "robot_now_offline" );
    }
  },
  chosen_robot_last_online_cloud_state: undefined,
  chosen_robot_online_cloud_change: function()
  {
    if( robot_controller.chosen_robot_last_online_cloud_state !== robot_controller.chosen_robot.online_cloud )
    {
      robot_controller.chosen_robot_last_online_cloud_state = robot_controller.chosen_robot.online_cloud;
      event_controller.call_callback( "chosen_robot_online_cloud_changed", robot_controller.chosen_robot_last_online_cloud_state );
    }
  },
  is_robot_version_more_or_equal: function( version )
  {
    var rv = robot_controller.chosen_robot.version_numbers;
    if( !rv )
    {
      return false;
    }

    if( version[0] < rv[0] )
    {
      return true;
    }
    if( version[0] === rv[0] && version[1] < rv[1] )
    {
      return true;
    }
    if( version[0] === rv[0] && version[1] === rv[1] && version[2] <= rv[2] )
    {
      return true;
    }

    return false;
  },
  robot_capabilities: [ ],
  robot_capabilities_update_check: {
    'has_run': false
  },
  got_got_robot_capabilities_from_robot( new_capabilities )
  {
    robot_controller.robot_capabilities = new_capabilities;
    localStorage.setItem( "robot.capabilities", JSON.stringify( new_capabilities ) );
    event_controller.call_callback( 'got_robot_capabilities' );
  },
  robot_capabilities_update: function()
  {

    if( localStorage.getItem( "robot.capabilities" ) )
    {
      robot_controller.robot_capabilities = JSON.parse( localStorage.getItem( "robot.capabilities" ) );
      robot_controller.robot_capabilities_update_check["version"] = robot_controller.chosen_robot.version;
      robot_controller.robot_capabilities_update_check["id"] = robot_controller.chosen_robot.id;
      robot_controller.robot_capabilities_update_check["has_run"] = true;
    }

    if( robot_controller.robot_capabilities_update_check["has_run"]
      && robot_controller.robot_capabilities_update_check["version"] === robot_controller.chosen_robot.version
      && robot_controller.robot_capabilities_update_check["id"] === robot_controller.chosen_robot.id )
      return;

    capabilities = [

      "bezier_task",
      "waterfall_task",
      "spline_task",
      "spline_v2_task",
      "ellise_task",
      "ellise_task_offset",

      "task_start_from_option",
      "task_merge_option",
      "coarse_start_option",
      "dash_offset_option",

      "spray_offset_as_time",

      "gps_info",
      "reconf_user",
      "modem_info",

      "load_job_topic"
    ];

    if( !robot_controller.is_robot_version_more_or_equal( [ 7, 0, 0 ] ) )
    {
      // Fill out for old robots that dont have the cabability to tell what it can do.
      robot_controller.robot_capabilities = [ ];

      if( robot_controller.is_robot_version_more_or_equal( [ 5, 5, 0 ] ) )
        robot_controller.robot_capabilities.push( "bezier_task" );

      if( robot_controller.is_robot_version_more_or_equal( [ 6, 0, 0 ] ) )
      {
        robot_controller.robot_capabilities.push( "task_merge_option" );
        robot_controller.robot_capabilities.push( "dash_offset_option" );
        robot_controller.robot_capabilities.push( "spline_task" );
        robot_controller.robot_capabilities.push( "ellipse_task" );
        robot_controller.robot_capabilities.push( "task_start_from_option" );
        robot_controller.robot_capabilities.push( "spray_offset_as_time" );
      }

      if( robot_controller.is_robot_version_more_or_equal( [ 6, 1, 0 ] ) )
      {
        robot_controller.robot_capabilities.push( "waterfall_task" );
        robot_controller.robot_capabilities.push( "modem_info" );
      }

      if( robot_controller.is_robot_version_more_or_equal( [ 6, 4, 0 ] ) )
        robot_controller.robot_capabilities.push( "ellipse_task_offset" );

      if( robot_controller.is_robot_version_more_or_equal( [ 6, 7, 0 ] ) )
      {
        robot_controller.robot_capabilities.push( "spline_v2_task" );
        robot_controller.robot_capabilities.push( "gps_info" );
        robot_controller.robot_capabilities.push( "reconf_user" );
      }

    }
    else if( robot_controller.chosen_robot.id > 0 )
      robot_controller.robot_capabilities = capabilities;

    robot_controller.robot_capabilities_update_check["version"] = robot_controller.chosen_robot.version;
    robot_controller.robot_capabilities_update_check["id"] = robot_controller.chosen_robot.id;
    robot_controller.robot_capabilities_update_check["has_run"] = true;

    console.log( "robot capabilities updated" );
    event_controller.call_callback( "robot_capabilities_updated" );

  },
  robot_has_all_capability: function( keys = [] )
  {
    return keys.reduce((accu,curr)=>accu && robot_controller.robot_has_capability(curr), true);
  },
  robot_has_any_capability: function( keys = [] )
  {
    return keys.reduce((accu,curr)=>accu || robot_controller.robot_has_capability(curr), false);
  },
  robot_has_capability: function( key )
  {
    if( !robot_controller.robot_capabilities_update_check["has_run"] )
      robot_controller.robot_capabilities_update();

    return robot_controller.robot_capabilities.indexOf( key ) >= 0;
  },
  fetch_chosen_robot_position: function( )
  {
    communication_controller.send( "pos", {
      robot: robot_controller.chosen_robot_id
    }, "all", 5 );
  },
  get chosen_robot_position()
  {
    var v = robot_controller.chosen_robot.pos;
    if( v.x == 0 && v.y === 0 )
    {
      // TODO: Throw error instead of console warning
      if(DEBUG_MODE)
        console.warn( new ReferenceError( "No robot position" ) );
      // throw new ReferenceError( "No robot position" );
    }
    return v;
  },
  get has_chosen_robot_position()
  {
    let v;
    try
    {
      v = robot_controller.chosen_robot_position;
    }
    catch(e)
    {
      console.warn(e);
    }
    if( v.x !== 0 || v.y !== 0 )
      return true;
    else
      return false;
  },
  _changing_name: false,
  change_robot_name: function( new_name )
  {
    if(robot_controller._changing_name)
      return;

    robot_controller._changing_name = true;
    communication_controller.send( 'set_robot_name', {
      robot: robot_controller.chosen_robot_id,
      new_name: new_name
    }, "cloud", 10 );
    robot_controller.chosen_robot.name = new_name;
  },
  increment_task_pos: function(pos)
  {
    robot_controller.set_task_pos( pos + 1 );
  },
  decrement_task_pos: function(pos)
  {
    robot_controller.set_task_pos( pos - 1 );
  },
  set_task_to_max: function()
  {
    robot_controller.set_task_pos( robot_controller.task_info["Task count"] );
  },
  set_task_pos: function( set )
  {
    if( set < 1 )
      set = 1;
    if( set > robot_controller.task_info["Task count"] )
      set = robot_controller.task_info["Task count"];
    communication_controller.send( 'goto_task', {
      robot: robot_controller.chosen_robot_id,
      task_number: set - 1
    }, "all", 10 );
  },
  set_near_pos: function()
  {
    communication_controller.send( 'goto_near', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  set_max_drive_speed: (newMaxSpeed) => {
    robot_controller.update_user_param("velocity_drive", newMaxSpeed, null);
  },
  set_max_spray_speed: (newMaxSpeed) => {
    robot_controller.update_user_param("velocity_spray", newMaxSpeed, null);
  },
  reset_bluetooth: function()
  {
    communication_controller.send( 'setup_bluetooth', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  // ------------- Commands ----------------
  set_allowed_topics: function( topics, server )
  {
    communication_controller.send( 'subscribe_topics', {
      robot: robot_controller.chosen_robot_id,
      topics: topics
    }, server, 10 );
  },
  cmd: function( msg )
  {
    communication_controller.send( 'cmd', {
      robot: robot_controller.chosen_robot_id,
      cmd: msg
    }, "all", 10 );
  },
  hmi_cmd: function( msg )
  {
    communication_controller.send( 'hmi_cmd', {
      robot: robot_controller.chosen_robot_id,
      cmd: msg
    }, "all", 10 );
  },
  ok: function()
  {
    robot_controller.cmd( "ok" );
  },
  ack: function()
  {
    robot_controller.cmd( "ack" );
  },
  emergency_stop: function()
  {
    robot_controller.cmd( "softemg" );
  },
  spray: function( duration, force = false)
  {
    if( !force )
    {
      if( robot_controller.user_state === TopStates.UNDEFINED || robot_controller.state_top === TopStates.UNDEFINED )
      {
        console.warn( "User or Top state unknown. Blocked 'pump' topic." );
        return;
      }
      if( robot_controller.user_state === TopStates.AUTOMATIC || robot_controller.state_top === TopStates.AUTOMATIC )
      {
        console.warn( "User or Top state AUTO. Blocked 'pump' topic." );
        return;
      }
    }

    if( duration )
    {
      communication_controller.send( 'spray', {
        robot: robot_controller.chosen_robot_id,
        duration: duration
      }, "all", 10 );
    }
    else
    {
      communication_controller.send( 'spray', {
        robot: robot_controller.chosen_robot_id
      }, "all", 10 );
  }
  },
  pump: function( turn_on, force = false)
  {
    if( !force )
    {
      if( robot_controller.user_state === TopStates.UNDEFINED || robot_controller.state_top === TopStates.UNDEFINED )
      {
        console.warn( "User or Top state unknown. Blocked 'pump' topic." );
        return;
      }
      if( robot_controller.user_state === TopStates.AUTOMATIC || robot_controller.state_top === TopStates.AUTOMATIC )
      {
        console.warn( "User or Top state AUTO. Blocked 'pump' topic." );
        return;
      }
    }

    communication_controller.send( 'pump', {
      robot: robot_controller.chosen_robot_id,
      start: turn_on
    }, "all", 10 );
  },
  waypoint_timeout: 0,
  add_waypoint: function()
  {
    communication_controller.send( 'point', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  new_job: function()
  {
    communication_controller.send( 'new_job', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  save_job: function()
  {
    communication_controller.send( 'save_job', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  post_process_robot_tasks: function(robot_tasks)
  {
    // Non-allowed Consecutive Options
    // I.e. do not merge two consecutive lines
    // if their options are one of these and differ.
    const naco = [
      "position_filtering_interference",
      "napping_version"
    ];

    const allow_merge = (T1, T2) =>
    {
      const allow_type = (type) => {
        const O1 = T1[type] ? T1[type] : [];
        const O2 = T2[type] ? T2[type] : [];

        const O1f = O1.filter(o=>naco.indexOf(o.key)!=-1).sort();
        const O2f = O2.filter(o=>naco.indexOf(o.key)!=-1).sort();
  
        const O1k = O1f.map(o=>o.key);
        const O1v = O1f.map(o=>o.value);
        const O2k = O2f.map(o=>o.key);
        const O2v = O2f.map(o=>o.value);
  
        if( O1f.length == 0 && O2f.length == 0 )
        {
          return true;
        }
        else if( O1f.length == 0 && O2f.length != 0 )
        {
          return false;
        }
        else if( O1f.length != 0 && O2f.length != 0 )
        {
          return O1k.equal(O2k) && O1v.equal(O2v);
        }
        else
        {
          return true;
        }
      };

      return allow_type("options") && allow_type("action_options");

    };

    for (let idx = 0; idx < robot_tasks.length - 1; idx++) {
      if(!allow_merge(robot_tasks[idx], robot_tasks[idx+1]))
      {
        if(!robot_tasks[idx].options)
          robot_tasks[idx].options = new OptionArray();
        robot_tasks[idx].options.push(new BoolRobotAction( "task_merge_next", false ).toRobotAction());
      }
    }

    // Non-allowed options for task type
    const naot = {
      'way': [
        "task_merge_force"
      ]
    };
    robot_tasks.forEach((task,tidx)=>{
      if( naot[task.type] )
      {
        if( task.action_options )
        {
          let delete_idx = [];
          task.action_options.forEach((option,oidx)=>{
            if( naot[task.type].indexOf(option.key) != -1 )
            {
              delete_idx.push(oidx);
            }
          });
          delete_idx.reverse().forEach(oidx=>robot_tasks[tidx].action_options.splice(oidx,1));
        }
        if( task.options )
        {
          let delete_idx = [];
          task.options.forEach((option,oidx)=>{
            if( naot[task.type].indexOf(option.key) != -1 )
            {
              delete_idx.push(oidx);
            }
          });
          delete_idx.reverse().forEach(oidx=>robot_tasks[tidx].options.splice(oidx,1));
        }
      }
    });

  },
  send_job: function( name, tasks, options, start_at =
  {index:0, percent:0})
  {
    console.log( "sending job with name " + name );
    var robot_tasks = tasks.map( function( task, i )
    {
      return task.toRobotTask();
    } );

    console.log( "task_merge_force before", robot_tasks.filter(task=>task.options&&task.options.findIndex(option=>option.key==="task_merge_force")>-1) );
    
    robot_controller.post_process_robot_tasks(robot_tasks);

    if( options )
    {
      options = OptionArray.from(options.map( function( option )
      {
        return option.toRobotAction();
      } ));
    }

    if(start_at.index < 0)
    {
      console.warn("Start from index missing! Resetting start_from index and percentage to 0.");
      start_at = {index:0, percent:0};
    }

    console.log( {
      robot: robot_controller.chosen_robot_id,
      name: name,
      tasks: JSON.copy( robot_tasks ),
      options: options
    }, start_at );

    console.log( "task_merge_next", robot_tasks.filter(task=>task.options&&task.options.findIndex(option=>option.key==="task_merge_next")>-1) );
    console.log( "task_merge_force after", robot_tasks.filter(task=>task.options&&task.options.findIndex(option=>option.key==="task_merge_force")>-1) );

    robot_controller.job_to_send = {
      robot: robot_controller.chosen_robot_id,
      name: name,
      tasks: robot_tasks,
      options: options,
      start_task: start_at.index,
      start_p: start_at.percent
    };

    if( robot_controller.robot_has_capability( "load_job_topic" ) )
    {
      robot_controller.cancel_send = false;
      message_controller.events.remove_callback( "job_part_recieved", robot_controller.send_next_part );
      message_controller.events.add_callback( "job_part_recieved", robot_controller.send_next_part );
      robot_controller.send_part( robot_controller.job_to_send );
    }
    else
      communication_controller.send( 'send_job', robot_controller.job_to_send, "all", Infinity );


    robot_controller.was_online = robot_controller.chosen_robot.online;
    event_controller.add_callback( "robot_now_online", robot_controller.resend_if_robot_went_offline );

  },
  was_online: true,
  resend_if_robot_went_offline()
  {
    var is_online = robot_controller.chosen_robot.online;
    if( !robot_controller.was_online && is_online )
    {
      if( robot_controller.robot_has_capability( "load_job_topic" ) )
        robot_controller.resend_last_part();
      else
        communication_controller.send( 'send_job', robot_controller.job_to_send, "all", Infinity );
    }
    robot_controller.was_online = is_online;
  },
  parts_send: 0,
  parts_to_send: 0,
  is_sending: false,
  cancel_send: false,
  last_job_part_send: 0,
  resend_interval: 0,
  send_part: function( job_to_send )
  {
    // Calculate all packages
    var robot = job_to_send.robot;
    var tasks = job_to_send.tasks;
    var first_part = JSON.copy( job_to_send );
    delete first_part.tasks;
    delete first_part.robot;
    first_part = JSON.stringify( first_part );

    var max_package_size = 1024; // 1 kilo byte
    var parts = first_part.match( /.{1,1024}/g );

    var time_id = (new Date).getTime();

    var messages = [ ];
    var first_messages = 0;
    parts.forEach( function( p, i )
    {
      messages.push( {
        robot: robot,
        id: i,
        data: p,
        time_id: time_id
      } );
      first_messages++;
    } );
    messages[0].p = first_messages;

    tasks = tasks.map( function( t, i )
    {
      delete t.id;
      return {
        data: JSON.stringify( t ),
        id: i
      };
    } );
    while( tasks.length )
    {
      var chars_added = 0;
      var msg = {
        robot: robot,
        id: messages.last().id + 1,
        data: [ ],
        time_id: time_id
      };
      while( chars_added < max_package_size && tasks.length )
      {
        if( (chars_added + tasks[0].data.length) <= max_package_size )
        {
          msg.data.push( tasks[0] );
          chars_added += tasks[0].data.length;
          tasks = tasks.splice( 1 );
        }
        else
        {
          var chars_to_add = tasks[0].data.length - ((chars_added + tasks[0].data.length) - max_package_size);
          msg.data.push( JSON.copy( tasks[0] ) );
          msg.data.last().data = tasks[0].data.substring( 0, chars_to_add );
          tasks[0].data = tasks[0].data.substring( chars_to_add );
          chars_added += chars_to_add;
        }
      }
      messages.push( msg );
    }
    messages[0].packages = messages.length;
    robot_controller.parts_to_send = messages.length;
    robot_controller.parts_send = 0;

    robot_controller.messages_to_send = messages;

    communication_controller.send( 'load_job', messages[0], "all", Infinity );
    robot_controller.last_job_part_send = time.now;
    clearInterval( robot_controller.resend_interval );
    robot_controller.resend_interval = null;
    robot_controller.resend_interval = setInterval( robot_controller.resend_last_part, 5000 );
  },
  send_next_part: function( msg )
  {
    if( robot_controller.cancel_send )
    {
      clearInterval( robot_controller.resend_interval );
      robot_controller.resend_interval = null;
    }
    else
    {
      logger.debug( msg );
      robot_controller.parts_send = msg.next;
      if( !msg.finnish )
      {
        communication_controller.send( 'load_job', robot_controller.messages_to_send[msg.next], "all", Infinity );
        robot_controller.last_job_part_send = time.now;
      }
      else
      {
        robot_controller.parts_send = robot_controller.parts_to_send;
        clearInterval( robot_controller.resend_interval );
        robot_controller.resend_interval = null;
      }
    }
  },
  resend_last_part: function()
  {
    if( (time.now - robot_controller.last_job_part_send) > 4000 )
    {
      robot_controller.last_job_part_send = time.now;
      if( robot_controller.parts_send !== robot_controller.parts_to_send && robot_controller.messages_to_send.length > 0 )
      {
        if( !robot_controller.messages_to_send[robot_controller.parts_send] )
          robot_controller.parts_send = 0;
        communication_controller.send( 'load_job', robot_controller.messages_to_send[robot_controller.parts_send], "all", Infinity );

      }
    }
  },
  generate_curve: function()
  {
    communication_controller.send( 'generate_curve', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  generate_parkinglot: function()
  {
    communication_controller.send( 'generate_parkinglot', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  auto_mode: function()
  {
    robot_controller.cmd( "auto" );
    event_controller.call_callback( "send_auto" );
  },
  manual_mode: function()
  {
    //clearInterval( robot_controller.deadman_sender );
    //robot_controller.pump( false );
    robot_controller.user_state = TopStates.MANUAL;
    robot_controller.cmd( "manual" );
  },
  softemg_mode: function()
  {
    robot_controller.cmd( "softemg" );
  },
  base_mode: function()
  {
    robot_controller.cmd( "base" );
  },
  update_user_param: function( param, val, server )
  {
    if(robot_controller.chosen_robot.id === -1)
    {
      const data = {"/user":{}};
      data["/user"][param] = {current:val};
      robot_controller.update_config(data);
      message_controller.events.call_callback( "updated_user_config" );
      return;
    }
    if( !server )
      server = "all";

    if((param === "projection" || param === "projection_external") && !robot_controller.chosen_robot.projection_change_allowed)
    {
      throw "Not allowed to change projection";
    }

    communication_controller.send( 'update_param', {
      robot: robot_controller.chosen_robot_id,
      key: param,
      val: val
    }, server, 10 );
  },
  update_user_params: function( options, server )
  {
    if(robot_controller.chosen_robot.id === -1)
    {
      const data = {"/user":{}};
      Object.entries(options).forEach(entry=>data["/user"][entry[0]] = {current:entry[1]});
      robot_controller.update_config(data);
      message_controller.events.call_callback( "updated_user_config" );
      return;
    }
    if( !server )
      server = "all";

    if(("projection" in options || "projection_external" in options) && !robot_controller.chosen_robot.projection_change_allowed)
    {
      throw "Not allowed to change projection";
    }

    communication_controller.send( 'update_params', {
      robot: robot_controller.chosen_robot_id,
      options: options
    }, server, 10 );
  },
  load_job_on_robot: function( uuid )
  {
    communication_controller.send( 'load_job', {
      robot: robot_controller.chosen_robot_id,
      UUID: uuid
    }, "all", 10 );
  },
  fetch_db_jobs: function()
  {
    communication_controller.send( 'get_db_jobs', {}, "cloud", 10 );
  },
  fetch_db_job_revisions: function( id )
  {
    communication_controller.send( 'get_job_revision', {
      id: id
    }, "cloud", 10 );
  },
  restart_app_node: function()
  {
    communication_controller.send( 'restart_app', {
      robot: robot_controller.chosen_robot_id
    }, "all", 10 );
  },
  update_config: function( data = {} )
  {
    const robot_id = data.robot ? data.robot : robot_controller.chosen_robot.id;
    var keys = Object.keys( data["/user"] );
    keys.forEach( function( key )
    {
      robot_controller.config[key] = data["/user"][key].current;
      if(robot_id !== -1 && (robot_id in robot_controller.robots))
      {
        switch (key) {
          case "projection":
            robot_controller.robots[robot_id].projection = robot_controller.config[key];
            break;
        
          default:
            break;
        }
      }
    } );
  },
  update_config_legacy: function( data )
  {
    var keys = Object.keys( data );
    keys.forEach( function( key )
    {
      robot_controller.config[key] = data[key];
    } );
  },
  server_uptime: function()
  {
    function got_uptime( data )
    {
      message_controller.events.remove_callback( "uptime", got_uptime );
      console.log( data.time, "seconds" );
      var seconds = data.time;
      var days = Math.floor( seconds / (60 * 60 * 24) );
      seconds = seconds - (days * 60 * 60 * 24);
      var hours = Math.floor( seconds / (60 * 60) );
      seconds = seconds - (hours * 60 * 60);
      var minutes = Math.floor( seconds / (60) );
      seconds = seconds - (minutes * 60);
      console.log( days, "days", hours, "hours", minutes, "minutes", seconds, "seconds" );
      var d = new Date();
      var server_start = new Date( d.getTime() - data.time * 1000 );
      console.log( server_start );
    }

    communication_controller.send( "uptime", {}, "cloud", 10 );
    message_controller.events.add_callback( "uptime", got_uptime );
  },
  get current_state()
  {
    var current_task_state = 0;
    if( this.task_info["Lineplanner on ramp up"] )
      current_task_state = 1;
    if( this.task_info["Lineplanner on line"] )
      current_task_state = 2;
    if( this.task_info["Lineplanner on ramp down"] )
      current_task_state = 3;
    return current_task_state;
  }

  ,
  user_info_event: new MultiEventController(),
  got_user_info: function( msg, duration )
  {
    robot_controller.user_info_event.call_callback( msg, duration );
  },

  get joystickControlLinkExists() {
    const connectedViaBluetooth = robot_controller.chosen_robot.online_bluetooth && !joystick_controller.use_internet;
    const connectedViaServer = joystick_controller.use_internet && robot_controller.emergencyStopLinkExists;
    const connected = connectedViaBluetooth || connectedViaServer;
    return connected;
  },

  get emergencyStopLinkExists() {
      return robot_controller.chosen_robot.online_cloud && navigator.onLine;
  },
};
$(()=>{
  message_controller.events.add_callback( "robot_velocities", robot_controller.update_config_legacy );
  message_controller.events.add_callback( "marking_parameters", robot_controller.update_config_legacy );
  message_controller.events.add_callback( "marking_calibration", robot_controller.update_config_legacy );
  message_controller.events.add_callback( "robot_geometri", robot_controller.update_config_legacy );
  message_controller.events.add_callback( "reconf_topic_/user", robot_controller.update_config );
  message_controller.events.add_callback( "set_robot_name_done", ()=>{robot_controller._changing_name = false;} )
  
  
  event_controller.add_callback( "got_user_info", robot_controller.got_user_info );
  event_controller.add_callback( "robot_list_updated", robot_controller.chosen_robot_online_change );
  event_controller.add_callback( "robot_list_updated", robot_controller.robot_capabilities_update );
  event_controller.add_callback("on_system_diag_change", robot_controller.on_system_diag_change);
  event_controller.add_callback("paint_indicator_warning", robot_controller.paintIndicatorWarning);

  setInterval(robot_controller.chosen_robot_online_change, 1000);
});
